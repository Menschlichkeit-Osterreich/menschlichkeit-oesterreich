---
description: Python development standards and best practices
---

# Python Development Instructions

## General Guidelines

- Follow PEP 8 for code style.
- Use type hints for better readability.
- Prefer list comprehensions over loops where appropriate.
- Handle exceptions properly with try-except blocks.
- Use virtual environments (venv) for dependency management.

## Best Practices

- Write docstrings for all public functions and classes.
- Use logging instead of print statements for debugging.
- Avoid global variables; use class attributes or parameters.
- Test your code with pytest or unittest.
- Keep functions small and focused on a single responsibility.

## Security

- Never hardcode secrets; use environment variables.
- Validate user inputs to prevent injection attacks.
- Use libraries like requests for HTTP calls securely.

## Performance

- Use generators for large data sets.
- Profile code with cProfile before optimizing.
- Prefer built-in functions over custom implementations.
