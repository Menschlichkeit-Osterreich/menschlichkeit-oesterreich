"""
Tests for the Security Monitoring Module
"""

import unittest
from unittest.mock import patch
from security.monitoring import SecurityMonitor, SecurityMetrics

class TestSecurityMonitoring(unittest.TestCase):
    """Test suite for the SecurityMonitor class"""

    def setUp(self):
        """Set up a new SecurityMonitor instance for each test"""
        self.monitor = SecurityMonitor()

    def test_get_security_metrics_returns_placeholder_data(self):
        """
        Verify that get_security_metrics returns the expected placeholder data
        from the new private methods.
        """
        # Call the method to get the metrics
        metrics = self.monitor.get_security_metrics()

        # Assert that the metrics are of the correct type
        self.assertIsInstance(metrics, SecurityMetrics)

        # Assert that the placeholder values are returned correctly
        self.assertEqual(metrics.total_logins, 1337)
        self.assertEqual(metrics.active_sessions, 42)
        self.assertEqual(metrics.two_factor_usage, 75)
        self.assertEqual(metrics.data_exports, 5)
        self.assertEqual(metrics.password_changes, 12)

    @patch('security.monitoring.logger')
    def test_placeholder_methods_log_info_messages(self, mock_logger):
        """
        Verify that the placeholder methods log appropriate info messages.
        """
        self.monitor.get_security_metrics()

        # Check that the logger was called with the expected messages
        mock_logger.info.assert_any_call("Using placeholder for total_logins metric.")
        mock_logger.info.assert_any_call("Using placeholder for active_sessions metric.")
        mock_logger.info.assert_any_call("Using placeholder for two_factor_usage metric.")
        mock_logger.info.assert_any_call("Using placeholder for data_exports metric.")
        mock_logger.info.assert_any_call("Using placeholder for password_changes metric.")

if __name__ == '__main__':
    unittest.main()
