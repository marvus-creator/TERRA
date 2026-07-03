from pystac_client import Client

STAC_URL = "https://earth-search.aws.element84.com/v1"
COLLECTION = "sentinel-2-l2a"


def search_scenes(bbox, date_range, max_cloud=60, max_items=300):
    client = Client.open(STAC_URL)
    search = client.search(
        collections=[COLLECTION],
        bbox=bbox,
        datetime=date_range,
        query={"eo:cloud_cover": {"lt": max_cloud}},
        max_items=max_items,
    )
    return sorted(search.items(), key=lambda item: item.datetime)
