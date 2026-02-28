<?php

namespace Drupal\menschlichkeit_games\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Block\BlockPluginInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Url;
use Drupal\Core\Link;

/**
 * Provides a 'Democracy Game' Block.
 *
 * @Block(
 *   id = "democracy_game_block",
 *   admin_label = @Translation("Brücken Bauen - Democracy Game"),
 *   category = @Translation("Menschlichkeit Games")
 * )
 */
class DemocracyGameBlock extends BlockBase implements BlockPluginInterface {

  /**
   * {@inheritdoc}
   */
  public function build() {
    $config = $this->getConfiguration();
    
    // Get game URL (can be configured in block settings)
    $game_url = $config['game_url'] ?? '/games/';
    $show_preview = $config['show_preview'] ?? TRUE;
    $block_style = $config['block_style'] ?? 'card';

    $build = [
      '#theme' => 'democracy_game_block',
      '#game_url' => $game_url,
      '#show_preview' => $show_preview,
      '#block_style' => $block_style,
      '#attached' => [
        'library' => [
          'menschlichkeit_games/democracy_game_block'
        ],
      ],
      '#cache' => [
        'max-age' => 3600, // Cache for 1 hour
        'contexts' => ['url.path'],
      ],
    ];

    return $build;
  }

  /**
   * {@inheritdoc}
   */
  public function blockForm($form, FormStateInterface $form_state) {
    $config = $this->getConfiguration();

    $form['game_url'] = [
      '#type' => 'url',
      '#title' => $this->t('Game URL'),
      '#description' => $this->t('URL to the Democracy Game. Leave empty to use default (/games/).'),
      '#default_value' => $config['game_url'] ?? '/games/',
      '#maxlength' => 255,
    ];

    $form['show_preview'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Show game preview'),
      '#description' => $this->t('Display a preview of the game content in the block.'),
      '#default_value' => $config['show_preview'] ?? TRUE,
    ];

    $form['block_style'] = [
      '#type' => 'select',
      '#title' => $this->t('Block style'),
      '#description' => $this->t('Choose the visual style for the block.'),
      '#options' => [
        'card' => $this->t('Card style'),
        'banner' => $this->t('Banner style'),
        'minimal' => $this->t('Minimal style'),
        'feature' => $this->t('Featured style'),
      ],
      '#default_value' => $config['block_style'] ?? 'card',
    ];

    $form['advanced'] = [
      '#type' => 'details',
      '#title' => $this->t('Advanced settings'),
      '#collapsible' => TRUE,
      '#collapsed' => TRUE,
    ];

    $form['advanced']['analytics_tracking'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Enable analytics tracking'),
      '#description' => $this->t('Track clicks and interactions with this block.'),
      '#default_value' => $config['analytics_tracking'] ?? TRUE,
    ];

    $form['advanced']['custom_css_class'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Custom CSS class'),
      '#description' => $this->t('Additional CSS class for custom styling.'),
      '#default_value' => $config['custom_css_class'] ?? '',
      '#maxlength' => 100,
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function blockSubmit($form, FormStateInterface $form_state) {
    parent::blockSubmit($form, $form_state);
    
    $values = $form_state->getValues();
    $this->configuration['game_url'] = $values['game_url'];
    $this->configuration['show_preview'] = $values['show_preview'];
    $this->configuration['block_style'] = $values['block_style'];
    $this->configuration['analytics_tracking'] = $values['advanced']['analytics_tracking'];
    $this->configuration['custom_css_class'] = $values['advanced']['custom_css_class'];
  }

  /**
   * {@inheritdoc}
   */
  public function defaultConfiguration() {
    return [
      'game_url' => '/games/',
      'show_preview' => TRUE,
      'block_style' => 'card',
      'analytics_tracking' => TRUE,
      'custom_css_class' => '',
    ];
  }

}