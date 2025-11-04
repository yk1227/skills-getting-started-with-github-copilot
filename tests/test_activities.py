import urllib.parse


def test_get_activities(client):
    resp = client.get("/activities")
    assert resp.status_code == 200
    data = resp.json()
    # Basic shape checks
    assert isinstance(data, dict)
    assert "Chess Club" in data


def test_signup_and_unsubscribe_flow(client):
    activity = "Chess Club"
    email = "teststudent@example.com"

    # Ensure email not already present
    resp = client.get("/activities")
    assert email not in resp.json()[activity]["participants"]

    # Sign up
    signup_url = f"/activities/{urllib.parse.quote(activity)}/signup?email={urllib.parse.quote(email)}"
    resp = client.post(signup_url)
    assert resp.status_code == 200
    assert email in client.get("/activities").json()[activity]["participants"]

    # Signing up again should return 400
    resp = client.post(signup_url)
    assert resp.status_code == 400

    # Now unregister via DELETE
    delete_url = f"/activities/{urllib.parse.quote(activity)}/participants?email={urllib.parse.quote(email)}"
    resp = client.delete(delete_url)
    assert resp.status_code == 200
    assert email not in client.get("/activities").json()[activity]["participants"]


def test_signup_activity_not_found(client):
    resp = client.post("/activities/NonExistentActivity/signup?email=a@b.com")
    assert resp.status_code == 404


def test_delete_nonexistent_participant(client):
    activity = "Chess Club"
    email = "noone@nowhere.com"
    delete_url = f"/activities/{urllib.parse.quote(activity)}/participants?email={urllib.parse.quote(email)}"
    resp = client.delete(delete_url)
    assert resp.status_code == 404
