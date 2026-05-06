#!/usr/bin/env python3
"""
AI-gestützter Code Generator für Menschlichkeit Österreich Platform
Generiert servicespezifischen Code basierend auf Templates und KI-Modellen
"""

import argparse
import json
from datetime import datetime
from pathlib import Path
from typing import Dict

# Constants
PACKAGE_JSON_FILE = "package.json"

# Optional import for future AI integration
OPENAI_AVAILABLE = False
try:
    OPENAI_AVAILABLE = True
except ImportError:
    pass


class MenschlichkeitAICodeGenerator:
    def __init__(self) -> None:
        self.project_root = Path(__file__).parent.parent
        self.services = {
            "api": "api.menschlichkeit-oesterreich.at",
            "crm": "crm.menschlichkeit-oesterreich.at",
            "frontend": "frontend",
            "games": "web",
            "website": "website",
            "n8n": "automation/n8n",
        }
        self.ai_config = self.load_ai_config()

    def load_ai_config(self) -> Dict:
        """Lade AI Konfiguration aus .vscode/settings.json"""
        settings_path = self.project_root / ".vscode" / "settings.json"
        if settings_path.exists():
            with open(settings_path, "r", encoding="utf-8") as f:
                content = f.read()
                # Entferne Kommentare für JSON parsing
                lines = content.split("\n")
                json_lines = [
                    line for line in lines if not line.strip().startswith("//")
                ]
                try:
                    settings = json.loads("\n".join(json_lines))
                    self.ai_config = {
                        "copilot_enabled": settings.get("github.copilot.enable", {}),
                        "model_path": settings.get(
                            "windowsAI.modelPath", "./.ai-models"
                        ),
                        "preferred_runtime": settings.get(
                            "windowsAI.preferredRuntime", "DirectML"
                        ),
                    }
                except json.JSONDecodeError:
                    self.ai_config = self.get_default_ai_config()
        else:
            self.ai_config = self.get_default_ai_config()

    def get_default_ai_config(self) -> Dict:
        return {
            "copilot_enabled": {"*": True},
            "model_path": "./.ai-models",
            "preferred_runtime": "DirectML",
        }

    def get_service_info(self, service: str) -> Dict:
        """Hole Service-spezifische Informationen"""
        service_info = {
            "api": {
                "tech_stack": "FastAPI/Python",
                "main_file": "app/main.py",
                "test_dir": "tests",
                "config_file": ".env",
                "dependencies": "requirements.txt",
                "ai_focus": "REST API endpoints, data models, authentication",
            },
            "crm": {
                "tech_stack": "Drupal 10 + CiviCRM/PHP",
                "main_file": "httpdocs/index.php",
                "test_dir": "tests",
                "config_file": "sites/default/settings.php",
                "dependencies": "composer.json",
                "ai_focus": "CiviCRM extensions, member management, SEPA integration",
            },
            "frontend": {
                "tech_stack": "React/TypeScript + TailwindCSS",
                "main_file": "src/App.tsx",
                "test_dir": "src/__tests__",
                "config_file": PACKAGE_JSON_FILE,
                "dependencies": PACKAGE_JSON_FILE,
                "ai_focus": "React components, design system integration, API calls",
            },
            "games": {
                "tech_stack": "Web Games + Prisma/PostgreSQL",
                "main_file": "games/index.html",
                "test_dir": "tests",
                "config_file": "schema.prisma",
                "dependencies": PACKAGE_JSON_FILE,
                "ai_focus": "Educational games, democracy simulations, XP systems",
            },
            "website": {
                "tech_stack": "WordPress/HTML",
                "main_file": "index.html",
                "test_dir": "tests",
                "config_file": "wp-config.php",
                "dependencies": "composer.json",
                "ai_focus": "Landing pages, content management, SEO optimization",
            },
            "n8n": {
                "tech_stack": "n8n Workflows/Node.js",
                "main_file": "workflows/main-workflow.json",
                "test_dir": "tests",
                "config_file": ".env",
                "dependencies": PACKAGE_JSON_FILE,
                "ai_focus": (
                    "Automation workflows, webhook integrations, " "data processing"
                ),
            },
        }
        return service_info.get(service, {})

    def generate_code_template(
        self, service: str, component_type: str, name: str
    ) -> str:
        """Generiere Code-Template basierend auf Service und Komponente"""
        service_info = self.get_service_info(service)

        templates = {
            "api": {
                "endpoint": self.generate_fastapi_endpoint_template,
                "model": self.generate_pydantic_model_template,
                "test": self.generate_pytest_template,
            },
            "crm": {
                "module": self.generate_drupal_module_template,
                "hook": self.generate_drupal_hook_template,
                "test": self.generate_phpunit_template,
            },
            "frontend": {
                "component": self.generate_react_component_template,
                "hook": self.generate_react_hook_template,
                "test": self.generate_jest_template,
            },
            "games": {
                "game": self.generate_game_template,
                "model": self.generate_prisma_model_template,
                "test": self.generate_game_test_template,
            },
            "n8n": {
                "workflow": self.generate_n8n_workflow_template,
                "node": self.generate_n8n_node_template,
                "test": self.generate_n8n_test_template,
            },
        }

        if service in templates and component_type in templates[service]:
            return templates[service][component_type](name, service_info)
        else:
            return f"# Generated {component_type} for {service}: {name}\n# TODO: Implement {name}"

    def generate_fastapi_endpoint_template(self, name: str, service_info: Dict) -> str:
        return f'''"""
{name} API Endpoint für Menschlichkeit Österreich
Generiert am: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models import {name.title()}
from app.schemas import {name.title()}Create, {name.title()}Response
from app.auth import get_current_user

router = APIRouter(prefix="/{name.lower()}", tags=["{name.lower()}"])

@router.get("/", response_model=List[{name.title()}Response])
async def get_{name.lower()}s(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Hole alle {name}s mit Pagination"""
    {name.lower()}s = db.query({name.title()}).offset(skip).limit(limit).all()
    return {name.lower()}s

@router.post("/", response_model={name.title()}Response, status_code=status.HTTP_201_CREATED)
async def create_{name.lower()}(
    {name.lower()}: {name.title()}Create,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Erstelle neuen {name}"""
    db_{name.lower()} = {name.title()}(**{name.lower()}.dict(), created_by=current_user.id)
    db.add(db_{name.lower()})
    db.commit()
    db.refresh(db_{name.lower()})
    return db_{name.lower()}

@router.get("/{{item_id}}", response_model={name.title()}Response)
async def get_{name.lower()}(
    item_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Hole spezifischen {name} by ID"""
    {name.lower()} = db.query({name.title()}).filter({name.title()}.id == item_id).first()
    if not {name.lower()}:
        raise HTTPException(status_code=404, detail="{name} not found")
    return {name.lower()}

@router.put("/{{item_id}}", response_model={name.title()}Response)
async def update_{name.lower()}(
    item_id: int,
    {name.lower()}_update: {name.title()}Create,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Update {name} by ID"""
    {name.lower()} = db.query({name.title()}).filter({name.title()}.id == item_id).first()
    if not {name.lower()}:
        raise HTTPException(status_code=404, detail="{name} not found")

    for key, value in {name.lower()}_update.dict(exclude_unset=True).items():
        setattr({name.lower()}, key, value)

    db.commit()
    db.refresh({name.lower()})
    return {name.lower()}

@router.delete("/{{item_id}}")
async def delete_{name.lower()}(
    item_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Lösche {name} by ID"""
    {name.lower()} = db.query({name.title()}).filter({name.title()}.id == item_id).first()
    if not {name.lower()}:
        raise HTTPException(status_code=404, detail="{name} not found")

    db.delete({name.lower()})
    db.commit()
    return {{"message": "{name} deleted successfully"}}
'''

    def generate_react_component_template(self, name: str, service_info: Dict) -> str:
        return f"""/**
 * {name} React Component für Menschlichkeit Österreich
 * Generiert am: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
 */

import React, {{ useState, useEffect }} from 'react';
import {{ useQuery, useMutation, useQueryClient }} from '@tanstack/react-query';
import {{ api }} from '../services/api';
import {{ {name}Type }} from '../types/{name.lower()}';

interface {name}Props {{
  id?: string;
  className?: string;
  onUpdate?: (data: {name}Type) => void;
}}

export const {name}: React.FC<{name}Props> = ({{
  id,
  className = "",
  onUpdate
}}) => {{
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  // Fetch {name} data
  const {{
    data: {name.lower()}Data,
    isLoading: isLoadingData,
    error
  }} = useQuery({{
    queryKey: ['{name.lower()}', id],
    queryFn: () => id ? api.get{name}(id) : null,
    enabled: !!id
  }});

  // Create/Update mutation
  const mutation = useMutation({{
    mutationFn: (data: Partial<{name}Type>) =>
      id ? api.update{name}(id, data) : api.create{name}(data),
    onSuccess: (data) => {{
      queryClient.invalidateQueries({{ queryKey: ['{name.lower()}'] }});
      onUpdate?.(data);
    }},
    onError: (error) => {{
      console.error('Error saving {name.lower()}:', error);
    }}
  }});

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {{
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries()) as Partial<{name}Type>;

    mutation.mutate(data);
  }};

  if (error) {{
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">
          Fehler beim Laden der {name} Daten: {{error.message}}
        </p>
      </div>
    );
  }}

  return (
    <div className={{`{name.lower()}-component ${{className}}`}}>
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          {{id ? `{name} bearbeiten` : `Neuen {name} erstellen`}}
        </h2>

        <form onSubmit={{handleSubmit}} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              defaultValue={{{name.lower()}Data?.name || ''}}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Beschreibung
            </label>
            <textarea
              id="description"
              name="description"
              rows={{3}}
              defaultValue={{{name.lower()}Data?.description || ''}}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              onClick={{() => window.history.back()}}
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={{mutation.isPending || isLoadingData}}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {{mutation.isPending ? 'Speichere...' : 'Speichern'}}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}};

export default {name};
"""

    def generate_drupal_module_template(self, name: str, service_info: Dict) -> str:
        return f"""<?php
/**
 * @file
 * {name} module für Menschlichkeit Österreich CiviCRM Integration
 * Generiert am: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
 */

/**
 * Implements hook_help().
 */
function {name.lower()}_help($route_name, \\Drupal\\Core\\Routing\\RouteMatchInterface $route_match) {{
  switch ($route_name) {{
    case 'help.page.{name.lower()}':
      return '<p>' . t('{name} module für Menschlichkeit Österreich.') . '</p>';
  }}
}}

/**
 * Implements hook_menu().
 */
function {name.lower()}_menu() {{
  $items = [];

  $items['{name.lower()}/admin'] = [
    'title' => '{name} Administration',
    'page callback' => '{name.lower()}_admin_page',
    'access arguments' => ['administer {name.lower()}'],
    'type' => MENU_NORMAL_ITEM,
  ];

  return $items;
}}

/**
 * Implements hook_permission().
 */
function {name.lower()}_permission() {{
  return [
    'administer {name.lower()}' => [
      'title' => t('Administer {name}'),
      'description' => t('Perform administration tasks for {name}.'),
    ],
    'access {name.lower()}' => [
      'title' => t('Access {name}'),
      'description' => t('Access {name} functionality.'),
    ],
  ];
}}

/**
 * Admin page callback.
 */
function {name.lower()}_admin_page() {{
  $form = \\Drupal::formBuilder()->getForm('\\Drupal\\{name.lower()}\\Form\\{name}AdminForm');
  return $form;
}}

/**
 * Implements hook_civicrm_pre().
 */
function {name.lower()}_civicrm_pre($op, $objectName, $id, &$params) {{
  if ($objectName == 'Contact' && $op == 'create') {{
    // Add custom logic for contact creation
    \\Drupal::logger('{name.lower()}')->info('New contact created: @id', ['@id' => $id]);
  }}
}}

/**
 * Implements hook_civicrm_post().
 */
function {name.lower()}_civicrm_post($op, $objectName, $objectId, &$objectRef) {{
  if ($objectName == 'Contact' && in_array($op, ['create', 'edit'])) {{
    // Sync with external systems
    {name.lower()}_sync_contact($objectId, $objectRef);
  }}
}}

/**
 * Sync contact with external systems.
 */
function {name.lower()}_sync_contact($contact_id, $contact_data) {{
  try {{
    $api_client = \\Drupal::service('{name.lower()}.api_client');
    $result = $api_client->syncContact($contact_id, $contact_data);

    if ($result) {{
      \\Drupal::logger('{name.lower()}')->info('Contact synced successfully: @id', ['@id' => $contact_id]);
    }}
  }} catch (\\Exception $e) {{
    \\Drupal::logger('{name.lower()}')->error('Error syncing contact @id: @error', [
      '@id' => $contact_id,
      '@error' => $e->getMessage()
    ]);
  }}
}}
"""

    def run_interactive_generation(self):
        """Interaktiver Modus für Code-Generierung"""
        print("🤖 AI Code Generator für Menschlichkeit Österreich")
        print("=" * 50)

        # Service auswählen
        print("\nVerfügbare Services:")
        for i, service in enumerate(self.services.keys(), 1):
            info = self.get_service_info(service)
            print(f"  {i}. {service} ({info.get('tech_stack', 'Unknown')})")

        service_choice = input("\nService auswählen (1-6): ")
        service = list(self.services.keys())[int(service_choice) - 1]

        # Component Type
        component_type = input(
            f"\nComponent Type für {service} (endpoint/component/module/etc.): "
        )

        # Name
        name = input("Component Name: ")

        # Code generieren
        print(f"\n🔄 Generiere {component_type} '{name}' für Service '{service}'...")
        code = self.generate_code_template(service, component_type, name)

        # Ausgabe
        print("\n" + "=" * 60)
        print("GENERIERTER CODE:")
        print("=" * 60)
        print(code)

        # Save option
        save = input("\nCode in Datei speichern? (y/n): ")
        if save.lower() == "y":
            service_path = self.project_root / self.services[service]
            filename = (
                f"{name.lower()}.{self.get_file_extension(service, component_type)}"
            )
            file_path = service_path / filename

            file_path.parent.mkdir(parents=True, exist_ok=True)
            file_path.write_text(code, encoding="utf-8")
            print(f"✅ Code gespeichert: {file_path}")

    def get_file_extension(self, service: str, component_type: str) -> str:
        """Bestimme Dateierweiterung basierend auf Service und Component Type"""
        extensions = {
            "api": {"endpoint": "py", "model": "py", "test": "py"},
            "crm": {"module": "module", "hook": "php", "test": "php"},
            "frontend": {"component": "tsx", "hook": "ts", "test": "test.tsx"},
            "games": {"game": "js", "model": "prisma", "test": "test.js"},
            "n8n": {"workflow": "json", "node": "js", "test": "test.js"},
        }
        return extensions.get(service, {}).get(component_type, "txt")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="AI Code Generator für Menschlichkeit Österreich"
    )
    parser.add_argument(
        "--service",
        choices=["api", "crm", "frontend", "games", "website", "n8n"],
        help="Target service",
    )
    parser.add_argument("--component-type", help="Type of component to generate")
    parser.add_argument("--name", help="Name of the component")
    parser.add_argument(
        "--interactive", action="store_true", help="Run in interactive mode"
    )

    args = parser.parse_args()

    generator = MenschlichkeitAICodeGenerator()

    if args.interactive or not (args.service and args.component_type and args.name):
        generator.run_interactive_generation()
    else:
        code = generator.generate_code_template(
            args.service, args.component_type, args.name
        )
        print(code)
