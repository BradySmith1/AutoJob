import json

import requests
from fake_useragent import UserAgent
import sys
from bs4 import BeautifulSoup


def retrieve_web_page(url):
    ua = UserAgent()
    session = requests.Session()
    session.headers.update({'User-Agent': str(ua.firefox)})
    return session.get(url)


def find_product_details(product):
    return product.find('span').string


def find_product(page):
    products = []
    raw_products = page.find_all('div', attrs={"data-testid": "product-pod"})
    for product in raw_products:
        product_details = product.find('div', attrs={"data-component": "ProductHeader"})
        product_price = product.find('div', class_='price-format__main-price')
        product_details = find_product_details(product_details)
        product_price = find_product_price(product_price)
        if product_price is not None:
            products.append({"name": product_details, "price": product_price})
    return products


def find_product_price(product):
    temp = []
    try:
        for price in product.find_all('span'):
            temp.append(price.string)
    except AttributeError:
        return None
    return float(' '.join([str(elem) for elem in temp])[1:].replace(" ", "").replace("\t", ""))


# Press the green button in the gutter to run the script.
if __name__ == '__main__':
    if len(sys.argv) == 1 or len(sys.argv) > 2:
        print("Usage: python main.py <url>")
        sys.exit(1)
    url_arg = sys.argv[1]
    page_parsed = BeautifulSoup(retrieve_web_page(url_arg).content, 'html.parser')
    # print(page_parsed.prettify())
    products_list = find_product(page_parsed)
    if products_list is None:
        print("No products found")
        sys.exit(1)
    products = {"available_products": products_list }
    products = json.dumps(products, indent=4)
    print(products)
    sys.stdout.flush()
