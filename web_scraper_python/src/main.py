import json

import selenium.common.exceptions
from flask import *
import pymongo
from datetime import datetime, timedelta
import scraper

app = Flask(__name__)


@app.route('/cache', methods=['GET'])
def get_cached_materials():
    name = request.args.get('name')
    name = name.replace("+", " ").replace("_", " ")
    company = request.args.get('company')
    zip_code = request.args.get('zip')
    if name is None or company is None:
        abort(400)

    # Checks cache
    # gets first material returned. Will have to redo this part of the code later
    cache_returned = list(db_collection.find({"name": {'$regex': name}, "company": company}))
    if cache_returned.__len__() > 0:
        cache_returned = cache_returned[0]
        ttl = cache_returned.get("ttl")
        if datetime.utcnow() >= ttl:
            db_collection.delete_one({"name": name, "company": company})
        else:
            return cache_returned

    # Scrapes website
    scraper_instance.set_company(company)
    # Needs to be changed later on, cant just take the first option
    if zip_code is not None:
        try:
            scraped_material = scrape_and_cache(name, company, zip_code)[0]
        except selenium.common.exceptions.NoSuchElementException:
            print("Not a valid zipcode.")
            abort(400)
    else:
        try:
            scraped_material = scrape_and_cache(name, company)[0]
        except selenium.common.exceptions.NoSuchElementException:
            print("Not a valid zipcode.")
            abort(400)
    if scraped_material is None:
        abort(404)
    else:
        material_to_cache = {"name": scraped_material.get("name"), "price": scraped_material.get("price"),
                             "company": company, "ttl": (datetime.utcnow() + timedelta(days=7)).timestamp()}
        db_collection.insert_one(material_to_cache)
        print(material_to_cache)
        # need to serialize the material_to_cache object, wont do it right now
        return {"name": scraped_material.get("name"), "price": scraped_material.get("price"), "company": company}


def scrape_and_cache(name, company, zip_code=None):
    url_arg = build_url(company, name)
    scraper_instance.set_material(name)
    scraper_instance.get_page(url_arg, zip_code)
    if company == "homedepot":
        products_list = scraper_instance.get_products_homedepot()
    else:
        products_list = scraper_instance.get_products_lowes()
    if products_list is None or products_list.__len__() == 0:
        return None
    return products_list


def build_url(company_name, item_name):
    if company_name == "homedepot":
        url_arg = "https://www.homedepot.com/s/" + item_name
    else:
        url_arg = "https://www.lowes.com/search?searchTerm=" + item_name
    return url_arg


if __name__ == "__main__":
    scraper_instance = scraper.WebScraper()
    client = pymongo.MongoClient("mongodb://localhost:27017/")
    db = client["webCacheDB"]
    db_collection = db["materialCache"]
    app.run(debug=True, port=3005)
