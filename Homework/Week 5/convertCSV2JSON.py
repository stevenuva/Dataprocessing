# Dataprocessing Week 5 (linked views)
# Name: Steven Kuhnen (10305882)
#
# Converts a csv file to a json file

import csv
import json


def convert_to_json(filename):
    """converts csv file to a json file"""

    # path to the csv and json file
    csv_filename = filename + ".csv"
    json_filename = filename + ".json"

    # read in csv file and put output in a list
    with open(csv_filename, "r") as csv_file:
        csv_list = list(csv.DictReader(csv_file))

    # write csv list into a json file
    with open(json_filename, "w") as json_file:
        data_dic = {"data": csv_list}
        json.dump(data_dic, json_file)


# convert the csv files needed to json
convert_to_json("eu_health_spending")
convert_to_json("eu_life_expect")
