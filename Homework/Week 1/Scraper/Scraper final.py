#!/usr/bin/env python
# Name: Steven Kuhnen
# Student number: 10305882
"""
This script scrapes IMDB and outputs a CSV file with highest rated tv series.
"""

import csv
import re

from requests import get
from requests.exceptions import RequestException
from contextlib import closing
from bs4 import BeautifulSoup

TARGET_URL = "http://www.imdb.com/search/title?num_votes=5000,&sort=user_rating,desc&start=1&title_type=tv_series"
BACKUP_HTML = "tvseries.html"
OUTPUT_CSV = "tvseries.csv"


def extract_tvseries(dom):
    """
    Extract a list of highest rated TV series from DOM (of IMDB page).
    Each TV series entry should contain the following fields:
    - TV Title
    - Rating
    - Genres (comma separated if more than one)
    - Actors/actresses (comma separated if more than one)
    - Runtime (only a number!)
    """
    # create an empty list
    list_dic = []

    # find information about all the series
    series = dom.find_all("div", class_="lister-item-content")

    # loop to retrieve information for every serie
    for serie in series:

        # creates or empties a dictioray
        serie_dic = {}

        # finds and stores the series title into the dictionary
        title = serie.find(href=re.compile("adv_li_tt"))
        serie_dic["Title"] = title.string

        # finds and stores the series rating into the dictionary
        rating = serie.find("span", "value")
        serie_dic["Rating"] = rating.string

        # loop to find multiple genres if necessary
        # finds and stores every genre into the dictionary
        for genre in serie.find_all("span", "genre"):
            genre_string = str(genre.string).replace("\n", "").replace("  ", "")
            serie_dic["Genre"] = genre_string

        # create an empty list
        list_actors = []

        # loop to find multiple actors if necessary
        # finds and stores every genre into the list
        for actor in serie.find_all(href=re.compile("adv_li_st")):
            list_actors.append(str(actor.string))

        # convert list into string seperating list items with a comma
        string_actors = ",".join(list_actors)

        # add string to the dictionary
        serie_dic["Actors"] = string_actors

        # finds and stores the series runtime into the dictionary
        # ensures string consist only out of numbers
        runtime = serie.find("span", "runtime")
        runtime_numbers = str(runtime.string).replace(" min", "")
        serie_dic["Runtime"] = runtime_numbers

        # append the dictionaty to the list
        list_dic.append(serie_dic)

    return list_dic


def save_csv(outfile, tvseries):
    """
    Output a CSV file containing highest rated TV-series.
    """
    writer = csv.writer(outfile)
    writer.writerow(["Title", "Rating", "Genre", "Actors", "Runtime"])

    # loop to write the values for every serie out on one row
    for serie in tvseries:
        writer.writerow([serie.get("Title"), serie.get("Rating"),
                         serie.get("Genre"), serie.get("Actors"),
                         serie.get("Runtime")])


def simple_get(url):
    """
    Attempts to get the content at `url` by making an HTTP GET request.
    If the content-type of response is some kind of HTML/XML, return the
    text content, otherwise return None
    """
    try:
        with closing(get(url, stream=True)) as resp:
            if is_good_response(resp):
                return resp.content
            else:
                return None
    except RequestException as e:
        print("The following error occurred during HTTP GET request to {0} : {1}".format(url, str(e)))
        return None


def is_good_response(resp):
    """
    Returns true if the response seems to be HTML, false otherwise
    """
    content_type = resp.headers["Content-Type"].lower()
    return (resp.status_code == 200
            and content_type is not None
            and content_type.find("html") > -1)


if __name__ == "__main__":

    # get HTML content at target URL
    html = simple_get(TARGET_URL)

    # save a copy to disk in the current directory, this serves as an backup
    # of the original HTML, will be used in grading.
    with open(BACKUP_HTML, "wb") as f:
        f.write(html)

    # parse the HTML file into a DOM representation
    dom = BeautifulSoup(html, "html.parser")

    # extract the tv series (using the function you implemented)
    tvseries = extract_tvseries(dom)

    # write the CSV file to disk (including a header)
    with open(OUTPUT_CSV, "w", newline="") as output_file:
        save_csv(output_file, tvseries)
