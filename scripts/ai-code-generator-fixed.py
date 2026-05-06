#!/usr/bin/env python3
"""
AI Code Generator für Menschlichkeit Österreich
Generiert KI-optimierte Code-Templates für alle Services
"""

import argparse
import json
import os
from pathlib import Path
from typing import Any, Dict


class MenschlichkeitAICodeGenerator:
    """AI-Enhanced Code Generator für Multi-Service NGO Platform"""

    def __init__(self, project_root: str = None):
        self.project_root = Path(project_root or os.getcwd())
        self.ai_config = self.load_ai_config()

    def load_ai_config(self) -> Dict:
        """Lade AI Konfiguration aus .vscode/settings.json"""
        settings_path = self.project_root / ".vscode" / "settings.json"
        if settings_path.exists():
            try:
                with open(settings_path, "r", encoding="utf-8") as f:
                    content = f.read()
                    # Entferne Kommentare für JSON parsing
                    lines = content.split("\n")
                    json_lines = [
                        line for line in lines if not line.strip().startswith("//")
                    ]
                    settings = json.loads("\n".join(json_lines))
                    return {
                        "copilot_enabled": settings.get("github.copilot.enable", {}),
                        "model_path": settings.get(
                            "windowsAI.modelPath", "./.ai-models"
                        ),
                        "preferred_runtime": settings.get(
                            "windowsAI.preferredRuntime", "DirectML"
                        ),
                    }
            except json.JSONDecodeError:
                return self.get_default_ai_config()
        return self.get_default_ai_config()

    def get_default_ai_config(self) -> Dict:
        """Default AI Konfiguration"""
        return {
            "copilot_enabled": {"*": True},
            "model_path": "./.ai-models",
            "preferred_runtime": "DirectML",
        }

    def get_service_info(self, service: str) -> Dict:
        """Service-spezifische Informationen"""
        service_info = {
            "api": {
                "tech_stack": "FastAPI/Python",
                "description": "Haupt-API für NGO Services",
                "ai_focus": "FastAPI endpoints, Pydantic models, auth",
            },
            "crm": {
                "tech_stack": "Drupal 10/CiviCRM",
                "description": "Customer Relationship Management",
                "ai_focus": (
                    "CiviCRM extensions, member management, " "SEPA integration"
                ),
            },
            "frontend": {
                "tech_stack": "React/TypeScript",
                "description": "NGO Frontend Interface",
                "ai_focus": (
                    "React components, design system integration, " "API calls"
                ),
            },
            "web": {
                "tech_stack": "Prisma/PostgreSQL",
                "description": "Educational Web Games",
                "ai_focus": ("Educational games, democracy simulations, " "XP systems"),
            },
            "website": {
                "tech_stack": "WordPress/PHP",
                "description": "Main NGO Website",
                "ai_focus": ("Landing pages, content management, " "SEO optimization"),
            },
            "automation": {
                "tech_stack": "n8n/Python",
                "description": "Workflow Automation",
                "ai_focus": (
                    "Automation workflows, webhook integrations, " "data processing"
                ),
            },
        }
        return service_info.get(service, {})

    def get_template_generators(self) -> Dict:
        """Template Generators pro Service"""
        return {
            "api": {
                "endpoint": self.generate_fastapi_endpoint_template,
                "model": self.generate_code_template,
                "test": self.generate_code_template,
            },
            "crm": {
                "module": self.generate_drupal_module_template,
                "hook": self.generate_code_template,
                "test": self.generate_code_template,
            },
            "frontend": {
                "component": self.generate_react_component_template,
                "hook": self.generate_code_template,
                "test": self.generate_code_template,
            },
            "web": {
                "game": self.generate_code_template,
            },
        }

    def generate_code_template(self, name: str, service_info: Dict) -> str:
        """Basis Code Template"""
        component_type = "component"
        service = service_info.get("tech_stack", "Unknown")
        return (
            f"# Generated {component_type} for {service}: {name}\n"
            f"# TODO: Implement {name}"
        )

    def generate_fastapi_endpoint_template(self, name: str, service_info: Dict) -> str:
        """FastAPI Endpoint Template"""
        return f'''"""
{name.title()} API Endpoint für Menschlichkeit Österreich
AI-Generated FastAPI code with Austrian NGO compliance
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import {name.title()}
from ..schemas import {name.title()}Create, {name.title()}Response
from ..auth import get_current_user

router = APIRouter(prefix="/{name.lower()}", tags=["{name.lower()}"])


@router.post(
    "/",
    response_model={name.title()}Response,
    status_code=status.HTTP_201_CREATED
)
async def create_{name.lower()}(
    {name.lower()}: {name.title()}Create,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Erstelle neuen {name.lower()} - DSGVO konform"""
    db_{name.lower()} = {name.title()}(
        **{name.lower()}.dict(), created_by=current_user.id
    )
    db.add(db_{name.lower()})
    db.commit()
    db.refresh(db_{name.lower()})
    return db_{name.lower()}


@router.get("/", response_model=List[{name.title()}Response])
async def read_{name.lower()}s(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Liste alle {name.lower()}s"""
    {name.lower()}s = db.query({name.title()}).offset(skip).limit(limit).all()
    return {name.lower()}s


@router.get("/{{item_id}}", response_model={name.title()}Response)
async def read_{name.lower()}(
    item_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Hole einzelnen {name.lower()} by ID"""
    {name.lower()} = (
        db.query({name.title()})
        .filter({name.title()}.id == item_id)
        .first()
    )
    if {name.lower()} is None:
        raise HTTPException(
            status_code=404, detail="{name.title()} not found"
        )
    return {name.lower()}


@router.put("/{{item_id}}", response_model={name.title()}Response)
async def update_{name.lower()}(
    item_id: int,
    {name.lower()}_update: {name.title()}Create,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Update {name.lower()} - DSGVO logging"""
    {name.lower()} = (
        db.query({name.title()})
        .filter({name.title()}.id == item_id)
        .first()
    )
    if {name.lower()} is None:
        raise HTTPException(
            status_code=404, detail="{name.title()} not found"
        )
    for key, value in {name.lower()}_update.dict().items():
        setattr({name.lower()}, key, value)
    db.commit()
    return {name.lower()}


@router.delete("/{{item_id}}")
async def delete_{name.lower()}(
    item_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Lösche {name.lower()} - DSGVO compliant"""
    {name.lower()} = (
        db.query({name.title()})
        .filter({name.title()}.id == item_id)
        .first()
    )
    if {name.lower()} is None:
        raise HTTPException(
            status_code=404, detail="{name.title()} not found"
        )
    db.delete({name.lower()})
    db.commit()
    return {{"message": "{name.title()} deleted successfully"}}
'''

    def generate_react_component_template(self, name: str, service_info: Dict) -> str:
        """React Component Template"""
        return f"""/**
 * {name} Component für Menschlichkeit Österreich
 * AI-Generated React TypeScript component
 * Austrian NGO Design System compliance
 */

import React, {{ useState }} from 'react';
import {{ useQuery, useMutation, useQueryClient }} from '@tanstack/react-query';

interface {name}Props {{
  className?: string;
  onSuccess?: () => void;
}}

interface {name}Data {{
  id: number;
  name: string;
  description?: string;
  created_at: string;
}}

const {name}: React.FC<{name}Props> = ({{
  className = "",
  onSuccess
}}) => {{
  const [formData, setFormData] = useState<Partial<{name}Data>>(
    {{ name: "", description: "" }}
  );

  const queryClient = useQueryClient();

  // AI-optimized data fetching
  const {{ data: items, isLoading, error }} = useQuery({{
    queryKey: ['{name.lower()}'],
    queryFn: () => fetch('/api/{name.lower()}').then(res => res.json())
  }});

  // AI-optimized mutations with Austrian NGO compliance
  const createMutation = useMutation({{
    mutationFn: (newItem: Partial<{name}Data>) =>
      fetch('/api/{name.lower()}', {{
        method: 'POST',
        headers: {{ 'Content-Type': 'application/json' }},
        body: JSON.stringify(newItem)
      }}).then(res => res.json()),
    onSuccess: () => {{
      queryClient.invalidateQueries({{ queryKey: ['{name.lower()}'] }});
      setFormData({{ name: "", description: "" }});
      onSuccess?.();
    }}
  }});

  const handleSubmit = (e: React.FormEvent) => {{
    e.preventDefault();
    createMutation.mutate(formData);
  }};

  if (isLoading) return <div>Lade {name}...</div>;
  if (error) return <div>Fehler beim Laden</div>;

  return (
    <div className={{`{name.lower()}-component ${{className}}`}}>
      <h2 className="text-2xl font-bold text-red-600 mb-4">
        {name} Verwaltung
      </h2>

      <form onSubmit={{handleSubmit}} className="mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            value={{formData.name || ""}}
            onChange={{(e) =>
              setFormData(prev => ({{ ...prev, name: e.target.value }}))
            }}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Beschreibung
          </label>
          <textarea
            value={{formData.description || ""}}
            onChange={{(e) =>
              setFormData(prev => ({{ ...prev, description: e.target.value }}))
            }}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
            rows={{3}}
          />
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Abbrechen
          </button>
          <button
            type="submit"
            disabled={{createMutation.isPending}}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            {{createMutation.isPending ? 'Speichere...' : 'Speichern'}}
          </button>
        </div>
      </form>

      <div className="grid gap-4">
        {{items?.map((item: {name}Data) => (
          <div key={{item.id}} className="p-4 border rounded-lg">
            <h3 className="font-medium">{{item.name}}</h3>
            <p className="text-gray-600">{{item.description}}</p>
          </div>
        ))}}
      </div>
    </div>
  );
}};

export default {name};
"""

    def generate_drupal_module_template(self, name: str, service_info: Dict) -> str:
        """Drupal Module Template"""
        return f"""<?php

/**
 * @file
 * {name} module für Menschlichkeit Österreich
 * AI-Generated Drupal 10 module with CiviCRM integration
 */

/**
 * Implements hook_help().
 */
function {name.lower()}_help(
    $route_name,
    \\Drupal\\Core\\Routing\\RouteMatchInterface $route_match
) {{
  switch ($route_name) {{
    case 'help.page.{name.lower()}':
      return '<p>' . t(
          '{name} module für Menschlichkeit Österreich.'
      ) . '</p>';
  }}
}}

/**
 * Implements hook_menu().
 */
function {name.lower()}_menu() {{
  $items = [];

  $items['{name.lower()}/admin'] = [
    'title' => '{name} Administration',
    'description' => 'Configure {name.lower()} settings',
    'page callback' => '{name.lower()}_admin_page',
    'access arguments' => ['administer {name.lower()}'],
    'type' => MENU_NORMAL_ITEM,
  ];

  return $items;
}}

/**
 * Admin page callback.
 */
function {name.lower()}_admin_page() {{
  $form = \\Drupal::formBuilder()->getForm(
      '\\Drupal\\{name.lower()}\\Form\\{name}AdminForm'
  );
  return $form;
}}

/**
 * Implements hook_entity_insert().
 */
function {name.lower()}_entity_insert(
    \\Drupal\\Core\\Entity\\EntityInterface $entity
) {{
  if ($entity->getEntityTypeId() == 'contact') {{
    $id = $entity->id();
    \\Drupal::logger('{name.lower()}')->info(
        'New contact created: @id',
        ['@id' => $id]
    );
  }}
}}

/**
 * CiviCRM integration hook.
 */
function {name.lower()}_civicrm_post(
    $op,
    $objectName,
    $objectId,
    &$objectRef
) {{
  if ($objectName == 'Contact' && $op == 'create') {{
    // Austrian NGO specific contact processing
    try {{
      $contact_id = $objectId;

      // DSGVO compliant data handling
      $result = civicrm_api3('Contact', 'get', [
        'id' => $contact_id,
      ]);

      if ($result['is_error'] == 0) {{
        \\Drupal::logger('{name.lower()}')->info(
            'Contact synced successfully: @id',
            ['@id' => $contact_id]
        );
      }}
    }} catch (Exception $e) {{
      \\Drupal::logger('{name.lower()}')->error(
          'Error syncing contact @id: @error',
          [
            '@id' => $contact_id,
            '@error' => $e->getMessage()
          ]
      );
    }}
  }}
}}
"""

    def interactive_generation(self):
        """Interaktiver Modus für Code-Generierung"""
        print("🤖 Menschlichkeit Österreich AI Code Generator")
        print("=" * 50)

        services = self.get_template_generators().keys()
        print(f"Verfügbare Services: {', '.join(services)}")

        service = input("\\nService auswählen: ").strip().lower()
        if service not in services:
            print(f"❌ Unbekannter Service: {service}")
            return

        service_info = self.get_service_info(service)
        generators = self.get_template_generators()[service]

        print(f"\\nComponent Types für {service} " f"({'/'.join(generators.keys())}): ")
        component_type = input("Component Type: ").strip().lower()

        if component_type not in generators:
            print(f"❌ Unbekannter Component Type: {component_type}")
            return

        name = input("Component Name: ").strip()

        print(
            f"\\n🔄 Generiere {component_type} '{name}' " f"für Service '{service}'..."
        )

        generator = generators[component_type]
        code = generator(name, service_info)

        # Schreibe generiertes Code-Template
        output_dir = self.project_root / service / "generated"
        output_dir.mkdir(exist_ok=True)

        extension = self.get_file_extension(service, component_type)
        output_file = output_dir / f"{name.lower()}.{extension}"

        with open(output_file, "w", encoding="utf-8") as f:
            f.write(code)

        print(f"✅ Code generiert: {output_file}")

    def get_file_extension(self, service: str, component_type: str) -> str:
        """Dateierweiterung basierend auf Service und Component Type"""
        extensions = {
            "api": {"endpoint": "py", "model": "py", "test": "py"},
            "crm": {"module": "module", "hook": "php", "test": "php"},
            "frontend": {"component": "tsx", "hook": "ts", "test": "test.tsx"},
            "web": {"game": "ts"},
        }
        return extensions.get(service, {}).get(component_type, "txt")


def main():
    """CLI Entry Point"""
    parser = argparse.ArgumentParser(
        description="AI Code Generator für Menschlichkeit Österreich"
    )
    parser.add_argument("--service", help="Service to generate code for")
    parser.add_argument("--component-type", help="Type of component to generate")
    parser.add_argument("--name", help="Name of the component")
    parser.add_argument("--interactive", action="store_true", help="Interactive mode")

    args = parser.parse_args()
    generator = MenschlichkeitAICodeGenerator()

    if args.interactive or not (args.service and args.component_type and args.name):
        generator.interactive_generation()
    else:
        service_info = generator.get_service_info(args.service)
        generators = generator.get_template_generators().get(args.service, {})

        if args.component_type in generators:
            generator_func = generators[args.component_type]
            code = generator_func(args.name, service_info)
            print(code)
        else:
            print(f"❌ Unbekannter Component Type: {args.component_type}")


if __name__ == "__main__":
    main()
