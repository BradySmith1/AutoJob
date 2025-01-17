import time

from selenium import webdriver
from bs4 import BeautifulSoup
from selenium.webdriver import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.support.wait import WebDriverWait


class WebScraper:
    """
    WebScraper class that is used to scrape the website for the material that was searched for.
    """
    driver = None  # Selenium webdriver
    company = None  # Company to search for
    material = None  # Material to search for
    store_number = None  # Store number that is found from a zip code
    options = webdriver.ChromeOptions()  # Options for the webdriver
    page = None  # Source code that is returned.
    timeout = 5  # Timeout for the webdriver

    def __init__(self, company=None):
        """
        Constructor for the WebScraper class. Initializes a bunch of arguments that are used to mimic a real web
        browser. :param company: Company to search for
        """
        self.company = company
        self.options.add_argument('authority=www.lowes.com')
        self.options.add_argument(
            'accept=text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7')
        self.options.add_argument('accept-language=en-US,en;q=0.9')
        self.options.add_argument('cache-control=no-cache')
        self.options.add_argument('pragma=no-cache')
        self.options.add_argument('referer=https://www.lowes.com')
        self.options.add_argument(
            'sec-ch-ua="Chromium";v="112", "Google Chrome";v="112", "Not:A-Brand";v="99"')
        self.options.add_argument('sec-ch-ua-mobile=?0')
        self.options.add_argument('sec-ch-ua-platform="Windows"')
        self.options.add_argument('sec-fetch-dest=document')
        self.options.add_argument('sec-fetch-mode=navigate')
        self.options.add_argument('sec-fetch-site=same-origin')
        self.options.add_argument('sec-fetch-user=?1')
        self.options.add_argument('upgrade-insecure-requests=1')
        self.options.add_argument("--start-maximized")
        self.options.add_argument(
            'user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36')
        self.options.add_argument('--disable-blink-features=AutomationControlled')
        self.options.add_experimental_option("excludeSwitches", ["enable-automation"])
        self.options.add_experimental_option('useAutomationExtension', False)
        self.options.add_argument("--headless=new")
        self.driver = webdriver.Chrome(options=self.options)

    def get_page(self, url, zip_code):
        """
        Gets the page source code from the website.
        :param url: The url to scrape
        :param zip_code: The zip code to search for
        :return:
        """
        self.driver.get(url)
        # Depending on if the zip code is None or not, the scraper will search for the zip code.
        if zip_code is not None:
            if self.company == "lowes":
                self.set_zipcode_lowes(zip_code)
            else:
                self.set_zipcode_homedepot(zip_code)
        if self.company == "lowes":
            self.set_store_number_lowes()
        else:
            self.set_store_number_homedepot()
        page_source = self.driver.page_source
        page_parsed = BeautifulSoup(page_source, 'html.parser')
        self.page = page_parsed
        return page_parsed

    def set_material(self, material):
        """
        Sets the material to search for.
        :param material: material to search for
        """
        self.material = material

    def set_company(self, company):
        """
        Sets the company to search for.
        :param company: Company to search for
        """
        if company != "homedepot" and company != "lowes":
            raise NotImplementedError
        else:
            self.company = company

    def set_zipcode_homedepot(self, zip_code):
        """
        Sets the zip code for the homedepot website.
        :param zip_code: Zip code to search for
        """
        self.driver.find_element(By.XPATH, "//button[@data-testid=\"my-store-button\"]").click()
        WebDriverWait(self.driver, self.timeout).until(
            lambda x: x.find_element(By.XPATH, "//div[@data-component=\"SearchInput\"]//input[position()=1]"))
        self.driver.find_element(By.XPATH, "//div[@data-component=\"SearchInput\"]//input[position()=1]").send_keys(
            zip_code)
        self.driver.find_element(By.XPATH, "//div[@data-component=\"SearchInput\"]//button[position()=1]").click()
        WebDriverWait(self.driver, self.timeout).until(lambda x: x.find_element(By.XPATH,
                                                                                "//div[@data-component=\"StorePod\"]//button[position()=1]").is_displayed())
        self.driver.find_element(By.XPATH, "//div[@data-component=\"StorePod\"]//button[position()=1]").click()
        time.sleep(1)

    def set_store_number_homedepot(self):
        """
        Sets the store number for the homedepot website.
        """
        self.driver.find_element(By.XPATH, "//button[@data-testid=\"my-store-button\"]").click()
        time.sleep(2)
        self.store_number = \
            self.driver.find_element(By.XPATH, "//h4[@data-testid=\"store-pod-name\"]//span[position()=2]").text.split(
                "#")[
                1]

    def get_products_homedepot(self):
        """
        Gets the products from the homedepot website.
        """
        def find_product_price(product_price):
            temp = []
            try:
                for price in product_price.find_all('span'):
                    temp.append(price.string)
            except AttributeError:
                return None
            return float(' '.join([str(elem) for elem in temp])[1:].replace(" ", "").replace("\t", ""))

        def find_product_details(product_details):
            """
            Finds the product details from the product.
            :param product_details: The product details that are being searched through.
            :return: The product details
            """
            return product_details.find('span').string

        products = []
        raw_products = self.page.find_all('div', attrs={"data-testid": "product-pod"})
        for product in raw_products:
            product_details = product.find('div', attrs={"data-component": "ProductHeader"})
            product_price = product.find('div', class_='price-format__main-price')
            product_details = find_product_details(product_details)
            product_price = find_product_price(product_price)
            if product_price is not None:
                products.append({"name": product_details, "price": product_price, "store_number": self.store_number})
        return products

    def set_zipcode_lowes(self, zip_code):
        """
        Sets the zip code for the lowes website.
        :param zip_code: The zip code to search for
        """
        self.driver.find_element(By.ID, 'store-search-handler').click()
        WebDriverWait(self.driver, self.timeout).until(
            lambda x: x.find_element(By.XPATH, '//div[@class="inputContainer"]//input[position()=1]'))
        input_field = self.driver.find_element(By.XPATH, "//div[@class=\"inputContainer\"]//input[position()=1]")
        input_field.send_keys(Keys.CONTROL, "a")
        input_field.send_keys(Keys.DELETE)
        input_field.send_keys(zip_code)
        self.driver.find_element(By.XPATH, '//div[@class="inputContainer"]//button[position()=2]').click()
        WebDriverWait(self.driver, self.timeout).until(
            lambda x: x.find_element(By.XPATH, '//div[@class="buttonsWrapper"]//button[position()=1]').is_displayed())
        if self.driver.find_element(By.XPATH,
                                    '//div[@class="buttonsWrapper"]//button[position()=1]//span[position()=1]').text != "My Store":
            self.driver.find_element(By.XPATH, '//div[@class="buttonsWrapper"]//button[position()=1]').click()
            time.sleep(1)
        else:
            self.driver.find_element(By.XPATH, '/html/body/div[12]/div[3]/button').click()
            time.sleep(1)

    def set_store_number_lowes(self):
        """
        Sets the store number for the lowes website.
        """
        self.driver.find_element(By.ID, 'store-search-handler').click()
        time.sleep(2)
        self.driver.find_element(By.XPATH, '//div[@class="detailsBtnWrapper"]//*[local-name() = \'svg\']').click()
        self.store_number = self.driver.find_element(By.XPATH, '//span[@class="storeNo"]').text.split("#")[1]

    def get_products_lowes(self):
        """
        Gets the products from the lowes website.
        :return: The products that were found on the website.
        """
        def find_product_price(product):
            """
            Finds the product price from the product.
            :param product: The product that is being searched through.
            :return: The product price
            """
            temp = []
            for product_pieces in product.find_all():
                if product_pieces.string is not None:
                    temp.append(product_pieces.string)
            temp = temp[1:]
            try:
                return float(' '.join([str(elem) for elem in temp]).replace(" ", "").replace("\t", ""))
            except ValueError:
                # might not be long term solution for price ranges
                val_index = temp.index('-')
                temp = temp[:val_index]
                lowest_value = float(' '.join([str(elem) for elem in temp]).replace(" ", "").replace("\t", ""))
                price_per_foot = lowest_value / 8
                length_of_board = float(self.material.split('x')[2])
                return price_per_foot * length_of_board

        def format_variable_price_details(product_details):
            """
            Formats the product details for the variable price.
            :param product_details: The product details that are being searched through.
            :return: The formatted product details
            """
            temp_index = product_details.find('in', product_details.find('in') + 1) + 2
            product_details = product_details[:temp_index] + " x " + self.material.split('x')[
                2] + "-ft " + product_details[temp_index + len(self.material.split('x')[2]):]
            return product_details

        products = []
        raw_variable_prices = self.page.find('div', class_='prdt-rng 1')
        raw_prices = self.page.find_all('div', class_='prdt-actl-pr')
        raw_details = self.page.find_all('span', class_='description-spn')
        done = False
        index = 0
        while done is False:
            if raw_variable_prices is not None:
                product_price = find_product_price(raw_variable_prices)
                product_details = raw_details[index].string
                product_details = format_variable_price_details(product_details)
                raw_variable_prices = None
            else:
                product_price = find_product_price(raw_prices[index])
                product_details = raw_details[index].string
            if product_price is not None:
                products.append({"name": product_details, "price": product_price, "store_number": self.store_number})
            index += 1
            if index == raw_prices.__len__():
                done = True
        return products
