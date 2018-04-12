#!/usr/bin/env python
# Name: Steven Kuhnen
# Student number: 10305882
"""
This script crawls the IMDB top 250 movies.
"""

import os
import csv
import codecs
import errno

from requests import get
from requests.exceptions import RequestException
from contextlib import closing
from bs4 import BeautifulSoup

# global constants
TOP_250_URL = 'http://www.imdb.com/chart/top'
OUTPUT_CSV = 'top250movies.csv'
SCRIPT_DIR = os.path.split(os.path.realpath(__file__))[0]
BACKUP_DIR = os.path.join(SCRIPT_DIR, 'HTML_BACKUPS')

# --------------------------------------------------------------------------
# Utility functions (no need to edit):


def create_dir(directory):
    """
    Create directory if needed.
    Args:
        directory: string, path of directory to be made
    Note: the backup directory is used to save the HTML of the pages you
        crawl.
    """

    try:
        os.makedirs(directory)
    except OSError as e:
        if e.errno == errno.EEXIST:
            # Backup directory already exists, no problem for this script,
            # just ignore the exception and carry on.
            pass
        else:
            # All errors other than an already existing backup directory
            # are not handled, so the exception is re-raised and the
            # script will crash here.
            raise


def save_csv(filename, rows):
    """
    Save CSV file with the top 250 most popular movies on IMDB.
    Args:
        filename: string filename for the CSV file
        rows: list of rows to be saved (250 movies in this exercise)
    """
    with open(filename, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow([
<<<<<<< HEAD
            'title', 'year', 'runtime', 'genre(s)', 'director(s)',
            'writer(s)', 'actor(s)', 'rating(s)', 'number of rating(s)'
=======
            'title', 'year', 'runtime', 'genre(s)', 'director(s)', 
            'writer(s)', 'actor(s)', 'rating(s)', 
            'number of rating(s)'
>>>>>>> f85eaaf28642a61a1264ec72bbd74c085fc6a569
        ])

        writer.writerows(rows)


def make_backup(filename, html):
    """
    Save HTML to file.
    Args:
        filename: absolute path of file to save
        html: (unicode) string of the html file
    """

    with open(filename, 'wb') as f:
        f.write(html)


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
        print('The following error occurred during HTTP GET request to {0} : {1}'.format(url, str(e)))
        return None


def is_good_response(resp):
    """
    Returns true if the response seems to be HTML, false otherwise
    """
    content_type = resp.headers['Content-Type'].lower()
    return (resp.status_code == 200
            and content_type is not None
            and content_type.find('html') > -1)


def main():
    """
    Crawl the IMDB top 250 movies, save CSV with their information.
    Note:
        This function also makes backups of the HTML files in a sub-directory
        called HTML_BACKUPS (those will be used in grading).
    """

    # Create a directory to store copies of all the relevant HTML files (those
    # will be used in testing).
    print('Setting up backup dir if needed ...')
    create_dir(BACKUP_DIR)

    # Make backup of the IMDB top 250 movies page
    print('Access top 250 page, making backup ...')
    top_250_html = simple_get(TOP_250_URL)
    top_250_dom = BeautifulSoup(top_250_html, "lxml")

    make_backup(os.path.join(BACKUP_DIR, 'index.html'), top_250_html)

    # extract the top 250 movies
    print('Scraping top 250 page ...')
    url_strings = scrape_top_250(top_250_dom)

    # grab all relevant information from the 250 movie web pages
    rows = []
    for i, url in enumerate(url_strings):  # Enumerate, a great Python trick!
        print('Scraping movie %d ...' % i)

        # Grab web page
        movie_html = simple_get(url)

        # Extract relevant information for each movie
        movie_dom = BeautifulSoup(movie_html, "lxml")
        rows.append(scrape_movie_page(movie_dom))

        # Save one of the IMDB's movie pages (for testing)
        if i == 83:
            html_file = os.path.join(BACKUP_DIR, 'movie-%03d.html' % i)
            make_backup(html_file, movie_html)

    # Save a CSV file with the relevant information for the top 250 movies.
    print('Saving CSV ...')
    save_csv(os.path.join(SCRIPT_DIR, 'top250movies.csv'), rows)


def scrape_top_250(soup):
    """
    Scrape the IMDB top 250 movies index page.
    Args:
        soup: parsed DOM element of the top 250 index page
    Returns:
        A list of strings, where each string is the URL to a movie's page on
        IMDB, note that these URLS must be absolute (i.e. include the http
        part, the domain part and the path part).
    """

    # create empty list
    movie_urls = []

    # find all the movies
    movies = soup.find_all("td", class_="titleColumn")

    # loop to retrieve part of the url of every movie
    # add the fully completed url to the list
    for movie in movies:
        for url in movie.find_all("a"):
            full_url = "http://www.imdb.com" + str(url.get("href"))
            movie_urls.append(full_url)

    return movie_urls


def scrape_movie_page(dom):
    """
    Scrape the IMDB page for a single movie
    Args:
        dom: pattern.web.DOM instance representing the page of 1 single
            movie.
    Returns:
        A list of strings representing the following (in order): title, year,
        duration, genre(s) (semicolon separated if several), director(s)
        (semicolon separated if several), writer(s) (semicolon separated if
        several), actor(s) (semicolon separated if several), rating, number
        of ratings.
    """

    # create an empty lists
    list_actors = []
    list_director = []
    list_genre = []
    list_writer = []

    # finds the widget containing the title
    widget = dom.find("div", id="ratingWidget")

    # retrieves the title
    title = widget.find("strong").string

    # finds the title block
    block = dom.find(class_="title_block")

    # finds and retrieves the year in the title block
    year_link = block.find("span", id="titleYear")
    year = year_link.find("a").string

    # finds and retrieves the duration in the title block
    find_duration = block.find("time", itemprop="duration")
    duration = str(find_duration.string).replace("  ", "").replace("\n", "")

    # finds and retrieves all the genres in the title block
    genres = block.find_all(itemprop="genre")

    # loop to append the found genres into a list
    for genre in genres:
        list_genre.append(genre.string)

    # finds and retrieves the rating in the title block
    rating = block.find("span", itemprop="ratingValue").string

    # finds and retrieves the number of votes in the title block
    find_votes = block.find(itemprop="ratingCount")
    votes = str(find_votes.string).replace(",", ".")

    # finds all the directors
    all_director = dom.find_all("span", itemtype="http://schema.org/Person",
                                itemprop="director")

    # loop to append the found directors into a list
    for name in all_director:
        list_director.append(name.find("span", itemprop="name").string)

    # finds all the writers
    all_writer = dom.find_all("span", itemtype="http://schema.org/Person",
                              itemprop="creator")

    # loop to append the found writers into a list
    for name in all_writer:
        list_writer.append(name.find("span", itemprop="name").string)

    # finds all the actors
    all_actors = dom.find_all("td", itemprop="actor")

    # loop to append the found actors into a list
    for name in all_actors:
        list_actors.append(name.find("span", itemprop="name").string)

    # converts the lists into a string with semicolons seperating the list items
    actors = ";".join(list_actors)
    director = ";".join(list_director)
    genre = ";".join(list_genre)
    writer = ";".join(list_writer)

    # create a list containing all the information strings
    list_string = [title, year, duration, genre, director, writer, actors,
                   rating, votes]

    return list_string


if __name__ == "__main__":
    main()  # call into the progam
