import requests
from bs4 import BeautifulSoup

# Step 1: Fetch HTML content
blog_name='10-nyc-neighborhoods-to-watch-in-2024'
url = f"https://streeteasy.com/blog/{blog_name}/"
response = requests.get(url)
html_content = response.text

# Step 2: Parse HTML content using BeautifulSoup
soup = BeautifulSoup(html_content, 'html.parser')

# Step 3: Remove specific div classes
classes_to_remove = ['popular-posts__container', 'block-listings','related-posts__wrapper','hero__series-description','post-header__info-container']
for class_name in classes_to_remove:
    elements = soup.find_all('div', class_=class_name)
    for element in elements:
        element.decompose()

# Get the cleaned HTML
cleaned_html = str(soup)

# Step 4: Output the cleaned HTML to a local file
output_file_name = f'{blog_name}.html'
with open(output_file_name, 'w', encoding='utf-8') as file:
    file.write(cleaned_html)

print(f"Cleaned HTML has been saved to {output_file_name}")
