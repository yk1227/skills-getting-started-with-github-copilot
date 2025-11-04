from copy import deepcopy
import pytest

from fastapi.testclient import TestClient

import src.app as app_module


ORIGINAL_ACTIVITIES = deepcopy(app_module.activities)


@pytest.fixture(autouse=True)
def reset_activities():
    """Reset the in-memory activities dict before each test to keep tests isolated."""
    app_module.activities = deepcopy(ORIGINAL_ACTIVITIES)
    yield
    app_module.activities = deepcopy(ORIGINAL_ACTIVITIES)


@pytest.fixture()
def client():
    return TestClient(app_module.app)
