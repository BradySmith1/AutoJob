import requests
from fake_useragent import UserAgent
import sys
from bs4 import BeautifulSoup


def retrieve_web_page(url):
    ua = UserAgent()
    session = requests.Session()
    session.headers.update({'User-Agent': str(ua.firefox)})
    return session.get(url)


def find_product_details(page):
    product_detail = []
    raw_product_details = page.find_all('div', attrs={"data-component": "ProductHeader"})
    for product in raw_product_details:
        product_detail.append(product.find('span').string)
    return product_detail


def find_product_prices(page):
    product_price = []
    raw_product_prices = page.find_all('div', class_='price-format__main-price')
    for product in raw_product_prices:
        temp = []
        for price in product.find_all('span'):
            temp.append(price.string)
        product_price.append(' '.join([str(elem) for elem in temp]))
    return product_price


# Press the green button in the gutter to run the script.
if __name__ == '__main__':
    if len(sys.argv) == 1 or len(sys.argv) > 2:
        print("Usage: python main.py <url>")
        sys.exit(1)
    url_arg = sys.argv[1]
    page_parsed = BeautifulSoup(retrieve_web_page(url_arg).content, 'html.parser')
    # print(page_parsed.prettify())
    product_details = find_product_details(page_parsed)
    product_prices = find_product_prices(page_parsed)
    products = dict(zip(product_details, product_prices))
    print(products)
