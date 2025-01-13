# ObfuscateLogs.py
#
# Copyright (C) 2024, David C. Merritt, david.c.merritt@siemens.com
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.
#
# ---------------------------------------------------------------------
#
# Script to process an individual log file or a folder of logs to 
# attempt to obfuscate any personal or sensitive data based on 
# pre-defined criteria. There is an optional keywords .ini file that 
# can be used to define user-specific keywords to be obfuscated.
#
# ---------------------------------------------------------------------
#
# 29/11/2024  merritt  initial release
#

import os
import sys
import re
import logging
from datetime import datetime

# version number
VERSION = "1.0.0" 

# Mapping dictionary for consistent obfuscation within a file
replacement_map = {}

def get_executable_directory():
    """
    Returns the directory where the script or compiled executable is located.
    This is used to determine where the script resides to find associated files.
    """
    if getattr(sys, 'frozen', False):  # Check if running as a compiled executable
        return os.path.dirname(sys.executable)
    else:
        return os.path.dirname(os.path.abspath(__file__))

# read in the user defined keywords ini file
def load_keywords_from_file(ini_filepath, script_filename):
    """
    Loads keyword/replacement pairs from a specified .ini file or a default file.
    If the file doesn't exist, it creates one with a default template for easy customization.
    
    Arguments:
    ini_filepath (str): Path to the user-defined .ini file (optional).
    script_filename (str): The filename of the script, used to generate default paths.
    
    Returns:
    dict: A dictionary of keywords and their corresponding replacement values.
    """

    # If no .ini file is provided, use the default one based on the script name
    if not ini_filepath:
        exe_dir = get_executable_directory()
        ini_filepath = os.path.join(exe_dir, os.path.splitext(os.path.basename(script_filename))[0] + '.ini')

    # If the file doesn't exist, create it with a default comment and example sections
    if not os.path.exists(ini_filepath):
        print(f"{ini_filepath} not found. Creating a new blank keyword file.")
        with open(ini_filepath, 'w') as f:
            f.write("# This file contains keyword=replacement pairs organized by sections.\n")
            f.write("[servers]\nserver1=generic_server1\nserver2=generic_server2\n\n")
            f.write("[users]\nadmin=generic_admin\nguest=generic_guest\n\n")
            f.write("[general]\npassword=obfuscated_password\nemail=obfuscated_email\n")
        return {}

    # Read the file using configparser
    import configparser
    config = configparser.ConfigParser()
    config.read(ini_filepath)

    # Combine all sections into a single dictionary
    keywords = {}
    for section in config.sections():
        for keyword, replacement in config.items(section):
            keywords[keyword.strip()] = replacement.strip()

    return keywords

# Setup logging
def setup_logging(output_folder):
    """
    Sets up logging configuration to record the obfuscation process.
    
    Arguments:
    output_folder (str): The directory where log files will be stored.
    
    Returns:
    str: The path to the log file created.
    """
    
    log_filename = os.path.join(output_folder, f"__obfuscation_log_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log")
    logging.basicConfig(
        filename=log_filename,
        level=logging.INFO,
        format="%(asctime)s - %(levelname)s - %(message)s",
    )
    logging.info("Log file initialized.")
    return log_filename

# Ensure the output folder exists
def ensure_output_folder(output_folder):
    """
    Ensures that the output folder exists. If not, it creates the folder.
    
    Arguments:
    output_folder (str): The path to the output folder.
    
    Raises:
    Exception: If there is an error while creating the output folder.
    """

    try:
        os.makedirs(output_folder, exist_ok=True)
    except Exception as e:
        logging.error(f"Error creating output folder {output_folder}: {e}")
        raise

# Primary obfuscation function
def obfuscate_content(content, file_path, keywords_dict, detailed_logging=False):
    """
    Processes the content of a file to identify and obfuscate sensitive data.
    Logs changes with before/after values, line numbers, and the type of obfuscation performed
    if detailed_logging is True.
    
    Arguments:
    content (str): The content of the file to be obfuscated.
    file_path (str): The path to the file being processed.
    keywords_dict (dict): The dictionary containing keywords and their replacement values.
    detailed_logging (bool): Whether to log detailed changes (default: False).
    
    Returns:
    str: The obfuscated content.
    """
    
    lines = content.splitlines()
    obfuscated_lines = []

    for line_number, line in enumerate(lines, start=1):
        original_line = line
        obfuscation_type = None  # Track which type of obfuscation was performed

        # Call individual obfuscation sub-routines
        new_line = obfuscate_http_https_urls(line, line_number, file_path)
        if new_line != line:
            obfuscation_type = 'HTTP/HTTPS URL Obfuscation'
            line = new_line  # Update line if modified by the URL obfuscation

        new_line = obfuscate_ipv4_addresses(line, line_number, file_path)
        if new_line != line:
            obfuscation_type = 'IPv4 Address Obfuscation'
            line = new_line  # Update line if modified by the IP obfuscation

        new_line = obfuscate_keywords(line, line_number, file_path, keywords_dict, detailed_logging)
        if new_line != line:
            obfuscation_type = 'Keyword Obfuscation'
            line = new_line  # Update line if modified by the keyword obfuscation

        # Add line to the obfuscated result
        obfuscated_lines.append(line)

        # Log changes if the line was modified and detailed logging is enabled
        if detailed_logging and original_line != line:
            logging.info(
                f"File: {file_path}, Line {line_number}: \n"
                f"Before: {original_line}\n"
                f"After:  {line}\n"
                f"Obfuscation Type: {obfuscation_type}\n"
            )

    return "\n".join(obfuscated_lines)

# Sub-routine to obfuscate based on user defined keywords
def obfuscate_keywords(line, line_number, file_path, keywords_dict, detailed_logging=False):
    """
    Replaces keywords in the line with their defined replacements.
    The keywords and their replacements are loaded from the .ini file.
    
    Arguments:
    line (str): The line to be processed.
    line_number (int): The line number in the file.
    file_path (str): The path to the file being processed.
    keywords_dict (dict): The dictionary containing keywords and their replacement values.
    detailed_logging (bool): Whether to log detailed changes (default: False).
    
    Returns:
    str: The obfuscated line.
    """
    
    def replace_keyword(match):
        keyword = match.group(0)
        return keywords_dict.get(keyword, keyword)  # Replace if a mapping exists

    # Regex to match any of the keywords
    if keywords_dict:
        keywords_pattern = r'\b(' + '|'.join(re.escape(keyword) for keyword in keywords_dict.keys()) + r')\b'
        new_line = re.sub(keywords_pattern, replace_keyword, line)

        # Log changes if detailed logging is enabled
        if detailed_logging and new_line != line:
            logging.info(
                f"File: {file_path}, Line {line_number}: \n"
                f"Before: {line}\n"
                f"After:  {new_line}\n"
                f"Obfuscation Type: Keyword Obfuscation\n"
            )

        return new_line

    return line  # Return the line unmodified if no keywords exist

# Sub-routine to obfuscate HTTP/HTTPS URLs
def obfuscate_http_https_urls(line, line_number, file_path):
    """
    Identifies and replaces the domain and subdomain of HTTP/HTTPS URLs 
    with generic replacements, while preserving the rest of the URL structure.
    
    Arguments:
    line (str): The line to be processed.
    line_number (int): The line number in the file.
    file_path (str): The path to the file being processed.
    
    Returns:
    str: The obfuscated line.
    """

    # Regex to match the domain and subdomain in a URL
    url_regex = r"(https?://)([a-zA-Z0-9.-]+)(/[^\s]*)?"

    def replace_domain(match):
        prefix = match.group(1)  # http:// or https://
        domain = match.group(2)  # Domain and subdomain
        path = match.group(3) if match.group(3) else ""  # Path (optional)

        # Check if the domain is already mapped for consistent obfuscation
        if domain not in replacement_map:
            generic_domain = f"generic-domain-{len(replacement_map) + 1}.com"
            replacement_map[domain] = generic_domain

        # Reconstruct the URL with the obfuscated domain
        return f"{prefix}{replacement_map[domain]}{path}"

    # Perform the replacement
    return re.sub(url_regex, replace_domain, line)

# Sub-routine to obfuscate IPv4 addresses
def obfuscate_ipv4_addresses(line, line_number, file_path):
    """
    Identifies and replaces IPv4 addresses in the line with generic replacements,
    unless the line contains the word 'version' or '.dll' (in which case, it is skipped).
    
    Arguments:
    line (str): The line to be processed.
    line_number (int): The line number in the file.
    file_path (str): The path to the file being processed.
    
    Returns:
    str: The obfuscated line.
    """

    # Check if the line contains 'version' or '.dll' to avoid obfuscating version or DLL-related lines
    if 'version' in line.lower() or '.dll' in line.lower():
        return line  # Skip modification if 'version' or '.dll' is present

    # Regex to match IPv4 addresses
    ipv4_regex = r"\b(?:\d{1,3}\.){3}\d{1,3}\b"

    def replace_ip(match):
        ip = match.group(0)

        # Check if the IP is already mapped for consistent obfuscation
        if ip not in replacement_map:
            generic_ip = f"192.0.2.{len(replacement_map) + 1}"  # Use reserved IP range for generic values
            replacement_map[ip] = generic_ip

        # Return the generic replacement
        return replacement_map[ip]

    # Perform the replacement
    return re.sub(ipv4_regex, replace_ip, line)

def detect_text_header_end(content):
    """
    Detects the end of the ASCII text header in a binary file.
    Heuristic: Look for a non-ASCII byte or a specific delimiter (e.g., double newline).
    Returns the byte offset where the text header ends.
    
    Arguments:
    content (bytes): The binary content of the file.
    
    Returns:
    int: The byte offset where the ASCII text header ends.
    """
    
    for i, byte in enumerate(content):
        # Check for non-ASCII bytes
        if byte > 127:
            return i
    return len(content)  # Assume the entire content is ASCII if no non-ASCII byte is found

# Process a single file
def process_file(file_path, output_folder, current_index, total_files, keywords_dict, detailed_logging=False):
    """
    Processes a single file to obfuscate sensitive data and saves the obfuscated content.
    
    Arguments:
    file_path (str): The path to the file to be processed.
    output_folder (str): The folder where the obfuscated file will be saved.
    current_index (int): The current file index (for logging purposes).
    total_files (int): The total number of files being processed.
    keywords_dict (dict): The dictionary containing keywords and their replacement values.
    detailed_logging (bool): Whether to log detailed changes (default: False).
    """

    try:
        # Construct the output file name
        base_name = os.path.basename(file_path)
        obfuscated_name = f"{os.path.splitext(base_name)[0]}_obfuscated{os.path.splitext(base_name)[1]}"
        output_path = os.path.join(output_folder, obfuscated_name)

        # Read the file in binary mode
        with open(file_path, "rb") as input_file:
            content = input_file.read()

        # Detect the end of the ASCII text header
        text_header_end = detect_text_header_end(content)

        # Separate the text header and binary body
        text_header = content[:text_header_end]
        binary_body = content[text_header_end:]

        # Decode and process the text header
        try:
            text_header_decoded = text_header.decode("ascii", errors="ignore")
        except UnicodeDecodeError as e:
            logging.error(f"Error decoding text header in file {file_path}: {e}")
            text_header_decoded = ""

        obfuscated_header = obfuscate_content(text_header_decoded, file_path, keywords_dict, detailed_logging)

        # Write the obfuscated header and untouched binary body to the output file
        with open(output_path, "wb") as output_file:
            output_file.write(obfuscated_header.encode("ascii", errors="ignore"))
            output_file.write(binary_body)

        progress = f"Processing file {current_index} of {total_files}"
        logging.info(f"{progress}: {file_path} -> {output_path}")
        print(f"{progress}: {file_path} -> {output_path}")
    except Exception as e:
        logging.error(f"Error processing file {file_path}: {e}")
        print(f"Error processing file {file_path}: {e}")

# Updated process_folder function to include detailed_logging
def process_folder(folder_path, output_folder, keywords_dict, detailed_logging):
    """
    Processes all files in a specified directory, obfuscating sensitive data and saving the results.
    
    Arguments:
    directory (str): The path to the directory containing files to be processed.
    output_folder (str): The folder where the obfuscated files will be saved.
    keywords_dict (dict): The dictionary containing keywords and their replacement values.
    detailed_logging (bool): Whether to log detailed changes (default: False).
    """

    try:
        total_files, total_folders = count_files_and_folders(folder_path)
        current_file_index = 0

        logging.info(f"Total files to process: {total_files}")
        logging.info(f"Total folders to process: {total_folders}")
        print(f"Total files to process: {total_files}")
        print(f"Total folders to process: {total_folders}")

        # Walk through the directory tree
        for root, dirs, files in os.walk(folder_path):
            relative_path = os.path.relpath(root, folder_path)
            current_output_folder = os.path.join(output_folder, relative_path)
            ensure_output_folder(current_output_folder)

            for file_name in files:
                current_file_index += 1
                file_path = os.path.join(root, file_name)
                process_file(file_path, current_output_folder, current_file_index, total_files, keywords_dict, detailed_logging)

        logging.info(f"Processed {total_files} files across {total_folders} folders.")
        print(f"Processed {total_files} files across {total_folders} folders.")
    except Exception as e:
        logging.error(f"Error processing folder {folder_path}: {e}")
        print(f"Error processing folder {folder_path}: {e}")

# Count total files and folders
def count_files_and_folders(folder_path):
    """
    Counts the total number of files and folders in a specified directory 
    and its subdirectories.

    Arguments:
    folder_path (str): The path to the directory where the files and folders 
                       will be counted.

    Returns:
    tuple: A tuple containing:
           - The total number of files in the directory (int).
           - The total number of folders in the directory (int).
    """

    total_files = 0
    total_folders = 0
    for root, dirs, files in os.walk(folder_path):
        total_files += len(files)
        total_folders += len(dirs)
    return total_files, total_folders

# Main function
def main():
    import argparse

    parser = argparse.ArgumentParser(description="Obfuscate sensitive data in log files.")
    parser.add_argument("path", nargs="?", help="Path to a log file or folder containing log files.")
    parser.add_argument("-o", "--output", help="Path to the output folder (optional).")
    parser.add_argument("-v", "--version", action="store_true", help="Display the version of the script.")
    parser.add_argument(
        "-d", "--detailed", 
        action="store_true", 
        help="Enable detailed logging of individual obfuscations (default: off)."
    )
    parser.add_argument(
        "-k", "--keywords", 
        help="Path to the keyword .ini file (optional). If not provided, defaults to the script's local .ini file."
    )
    args = parser.parse_args()

    if args.version:
        print(f"Obfuscation Script Version: {VERSION}")
        sys.exit(0)

    if not args.path:
        print("Error: You must specify a path to a file or folder.")
        sys.exit(1)

    if not os.path.exists(args.path):
        print(f"Error: The specified path does not exist: {args.path}")
        sys.exit(1)

    if os.path.isfile(args.path):
        default_output_folder = os.path.dirname(args.path)
    elif os.path.isdir(args.path):
        default_output_folder = args.path
    else:
        print(f"Error: The specified path is neither a file nor a folder: {args.path}")
        sys.exit(1)

    output_folder = args.output if args.output else default_output_folder
    ensure_output_folder(output_folder)
    log_file = setup_logging(output_folder)

    # Load keywords from the specified or default .ini file
    keywords_dict = load_keywords_from_file(args.keywords, __file__)

    print("Starting the obfuscation process...")
    if args.detailed:
        print("Detailed logging is enabled. Changes will be logged.")

    if os.path.isfile(args.path):
        process_file(args.path, output_folder, 1, 1, keywords_dict, args.detailed)
    elif os.path.isdir(args.path):
        process_folder(args.path, output_folder, keywords_dict, args.detailed)

    logging.info("Obfuscation process completed.")
    print(f"Obfuscation process completed. Log file created: {log_file}")

if __name__ == "__main__":
    main()
