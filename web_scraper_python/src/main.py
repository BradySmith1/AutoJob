import selenium.common.exceptions
from flask import *
import pymongo
from datetime import datetime, timedelta
import scraper
from fuzzywuzzy import fuzz

app = Flask(__name__)

# Ratio for searching algorithm
RATIO = 10


@app.route('/cache', methods=['GET'])
def get_cached_materials():
    name = request.args.get('name')
    name = name.replace("+", " ").replace("_", " ")
    company = request.args.get('company')
    zip_code = request.args.get('zip')
    if name is None or company is None or zip_code is None:
        abort(400)

    # Checks cache
    # gets first material returned. Will have to redo this part of the code later
    name = name.replace(" ", "")
    # TODO need to also add company to zip code cache to make sure that the store number is being found for the correct company.
    store_number = db_zipcode_collection.find_one({"zip": zip_code, "company": company})
    if store_number is not None:
        store_number = store_number.get("store_number")
        # implement fuzz ratio. Should grab all materials with a ratio of 10 or higher or scrape it.
        list_of_materials = db_material_collection.find({"company": company, "store_number": store_number})
        cache_returned = []
        for material in list_of_materials:
            ratio = fuzz.ratio(material.get("name"), name)
            if ratio >= 10:
                cache_returned.append(material)
        if cache_returned.__len__() > 0:
            cache_returned = cache_returned[0]
            ttl = cache_returned.get("ttl")
            if datetime.utcnow().timestamp() >= ttl:
                db_material_collection.delete_one({"name": name, "company": company})
            else:
                return {"name": cache_returned.get("name"), "price": cache_returned.get("price"),
                        "store_number": cache_returned.get("store_number"), "company": company}

    # Scrapes website
    scraper_instance.set_company(company)
    # Needs to be changed later on, cant just take the first option
    try:
        scraped_material = scrape_and_cache(name, company, zip_code)[0]
    except selenium.common.exceptions.NoSuchElementException:
        print("Not a valid zipcode.")
        abort(400)
    if scraped_material is None:
        abort(404)

    # Caches material
    if store_number is None:
        db_zipcode_collection.insert_one({"zip": zip_code, "company": company,
                                          "store_number": scraped_material.get("store_number")})
    # TODO might need to change the way i am cleaning the name of the material if i implement a better search algorithm
    material_name = scraped_material.get("name")
    material_name = material_name.replace(" ", "")

    material_to_cache = {"name": material_name, "price": scraped_material.get("price"),
                         "store_number": scraped_material.get("store_number"),
                         "company": company, "ttl": (datetime.utcnow() + timedelta(days=7)).timestamp()}
    db_material_collection.insert_one(material_to_cache)
    print(material_to_cache)
    # need to serialize the material_to_cache object, wont do it right now
    return {"name": scraped_material.get("name"), "price": scraped_material.get("price"),
            "store_number": scraped_material.get("store_number"), "company": company}


def scrape_and_cache(name, company, zip_code):
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
    db_material_collection = db["materialCache"]
    db_zipcode_collection = db["zipCodeCache"]
    app.run(debug=True, port=3005)
