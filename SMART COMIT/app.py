from flask import Flask, jsonify, request
import json

app = Flask(__name__)

# Load data from JSON file
def load_data():
    with open('data.json', 'r') as f:
        return json.load(f)

@app.route('/api/routes', methods=['GET'])
def get_routes():
    data = load_data()
    return jsonify(data['routes'])

@app.route('/api/buses', methods=['GET'])
def get_buses():
    data = load_data()
    return jsonify(data['buses'])

@app.route('/api/bus/<int:bus_id>', methods=['GET'])
def get_bus(bus_id):
    data = load_data()
    bus = next((b for b in data['buses'] if b['id'] == bus_id), None)
    if bus:
        return jsonify(bus)
    return jsonify({'error': 'Bus not found'}), 404

@app.route('/api/eta/<int:bus_id>', methods=['GET'])
def get_eta(bus_id):
    data = load_data()
    bus = next((b for b in data['buses'] if b['id'] == bus_id), None)
    if not bus:
        return jsonify({'error': 'Bus not found'}), 404

    route = next((r for r in data['routes'] if r['id'] == bus['routeId']), None)
    if not route:
        return jsonify({'error': 'Route not found'}), 404

    # Simple ETA calculation (placeholder)
    eta = "Approximately 10 minutes"
    return jsonify({'bus_id': bus_id, 'eta': eta})

if __name__ == '__main__':
    app.run(debug=True)
