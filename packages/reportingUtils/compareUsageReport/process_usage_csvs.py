import enum
import click
from rich.console import Console
from datetime import datetime, timedelta, date

console = Console()

PILOT_START_DATE = "2025-09-29"
# import csv
# import copy
# import os

# date_range_start = datetime(2025, 9, 29)
# date_range_end = datetime(2026, 1, 13)

# empty_row = {"org_code": "", "user_id": ""}

# while date_range_start <= date_range_end:
#     empty_row[date_range_start.strftime("%Y-%m-%d")] = 0  # type: ignore
#     date_range_start += timedelta(days=1)
# # print(empty_row)

# data = {}

# files_to_process = []
# for file_name in os.listdir("."):
#     if file_name.endswith(".csv") and "cpt_ovn" in file_name:
#         files_to_process.append(file_name)
#         print(file_name)
# print(files_to_process)

# with open("cpt_ovn.csv", newline="") as csv_in:
#     csv_reader = csv.reader(csv_in, delimiter=",", quotechar='"')
#     next(csv_reader, None)  # skip headers
#     for date, org_code, user_id, count in csv_reader:
#         existing_user = data.get(user_id)
#         if not existing_user:
#             data[user_id] = copy.deepcopy(empty_row)
#             # print(data[user_id])
#             data[user_id]["org_code"] = org_code
#             data[user_id]["user_id"] = user_id
#         data[user_id][date] = count

# with open("output_test.csv", "w", newline="") as csv_out:
#     csv_writer = csv.DictWriter(csv_out, fieldnames=empty_row.keys())
#     csv_writer.writeheader()
#     for user, counts in data.items():
#         csv_writer.writerow(counts)
def process_data(files_to_process):
    print(files_to_process)


class OutputType(enum.Enum):
    combined = enum.auto()
    separate = enum.auto()
    both = enum.auto()
    old_only = enum.auto()
    new_only = enum.auto()


@click.command()
@click.option("-s", "--start-date", type=click.DateTime(formats=["%Y-%m-%d"]), default=PILOT_START_DATE)
@click.option("-e", "--end-date", type=click.DateTime(formats=["%Y-%m-%d"]), default=str(date.today()))
@click.option("-o", "--output", type=click.Choice(OutputType, case_sensitive=False), default="both")
def cli(start_date, end_date, output: OutputType):
    console.print("[b u green]Old vs New Tracker Usage Report Generator[/b u green]")
    if click.confirm("Continue?"):
        print(start_date)
        print(end_date)
        print(output)


if __name__ == "__main__":
    cli()
