# backend/linux_tools.py
import asyncio
import subprocess
import os

# --- Command Execution ---
async def execute_command_async(command: str):
    """
    Executes a shell command asynchronously and yields its output line by line.
    For security, consider whitelisting commands or using a more secure method.
    """
    print(f"Executing command: {command}")
    try:
        # Use asyncio.create_subprocess_shell for non-blocking execution
        process = await asyncio.create_subprocess_shell(
            command,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            shell=True # Be cautious with shell=True in production
        )

        # Read stdout line by line
        while True:
            line = await process.stdout.readline()
            if not line:
                break
            yield line.decode().strip()

        # Read stderr line by line (after stdout is exhausted)
        while True:
            line = await process.stderr.readline()
            if not line:
                break
            yield f"ERROR: {line.decode().strip()}"

        # Wait for the process to finish and get return code
        await process.wait()
        if process.returncode != 0:
            yield f"Command exited with code {process.returncode}"

    except FileNotFoundError:
        yield f"Error: Command '{command.split()[0]}' not found."
    except Exception as e:
        yield f"An unexpected error occurred: {e}"

# --- Application Discovery ---
def get_installed_applications():
    """
    Attempts to find installed applications on a Linux system by parsing .desktop files.
    Returns a list of dictionaries with app details.
    This is a simplified implementation and might not find all apps or categories correctly.
    """
    app_paths = [
        '/usr/share/applications/',
        '/usr/local/share/applications/',
        os.path.expanduser('~/.local/share/applications/')
    ]
    applications = []
    found_executables = set() # To avoid duplicates

    for path in app_paths:
        if not os.path.exists(path):
            continue

        for filename in os.listdir(path):
            if filename.endswith('.desktop'):
                filepath = os.path.join(path, filename)
                app_info = parse_desktop_file(filepath)
                if app_info and app_info['executable'] not in found_executables:
                    applications.append(app_info)
                    found_executables.add(app_info['executable'])
    return applications

def parse_desktop_file(filepath: str):
    """Parses a .desktop file and extracts relevant application information."""
    app_data = {}
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line.startswith('Name='):
                    app_data['name'] = line[len('Name='):]
                elif line.startswith('Exec='):
                    # Extract the executable part, ignoring arguments
                    exec_line = line[len('Exec='):]
                    app_data['executable'] = exec_line.split(' ')[0].split('%')[0]
                elif line.startswith('Categories='):
                    categories = line[len('Categories='):].strip(';').split(';')
                    # Map common categories to simpler ones for frontend
                    if 'Utility' in categories or 'System' in categories:
                        app_data['category'] = 'system'
                    elif 'Network' in categories or 'Internet' in categories:
                        app_data['category'] = 'network'
                    elif 'Security' in categories or 'Development' in categories: # Broadly categorize dev tools as security for demo
                        app_data['category'] = 'security'
                    else:
                        app_data['category'] = 'system' # Default
                elif line.startswith('Icon='):
                    app_data['icon'] = line[len('Icon='):] # This would need mapping to Lucide icons or serving actual icons
                elif line.startswith('NoDisplay=true') or line.startswith('Hidden=true'):
                    return None # Skip hidden applications
                elif line.startswith('Type=Application'):
                    pass # Only process Application types
    except Exception as e:
        print(f"Error parsing .desktop file {filepath}: {e}")
        return None

    # Ensure essential fields are present
    if 'name' in app_data and 'executable' in app_data:
        # Provide a default category if not found
        if 'category' not in app_data:
            app_data['category'] = 'system'
        # Provide a default icon if not found (frontend will map this)
        if 'icon' not in app_data:
            app_data['icon'] = 'Terminal' # Default to terminal icon
        return app_data
    return None

# Example usage (for testing)
if __name__ == "__main__":
    async def test_command_execution():
        print("--- Testing 'ls -l' ---")
        async for line in execute_command_async("ls -l"):
            print(line)
        print("\n--- Testing 'echo Hello World' ---")
        async for line in execute_command_async("echo Hello World"):
            print(line)
        print("\n--- Testing 'nonexistent_command' ---")
        async for line in execute_command_async("nonexistent_command"):
            print(line)

    # asyncio.run(test_command_execution())

    print("\n--- Testing get_installed_applications ---")
    apps = get_installed_applications()
    for app in apps[:10]: # Print first 10 apps
        print(f"Name: {app.get('name')}, Exec: {app.get('executable')}, Category: {app.get('category')}")
    print(f"Found {len(apps)} applications.")