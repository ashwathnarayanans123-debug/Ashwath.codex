import java.util.*;
import java.io.*;

public class SmartCommute {
    private static List<Map<String, Object>> routes = new ArrayList<>();
    private static List<Map<String, Object>> buses = new ArrayList<>();

    public static void main(String[] args) {
        loadData();
        System.out.println("SmartCommute System Started");
        System.out.println("Available routes: " + routes.size());
        System.out.println("Available buses: " + buses.size());

        // Example usage
        displayRoutes();
        displayBuses();
    }

    private static void loadData() {
        try {
            // Load routes
            Map<String, Object> route1 = new HashMap<>();
            route1.put("id", 1);
            route1.put("name", "Route 1: MG Road to Jayanagar");
            List<Map<String, Object>> stops1 = new ArrayList<>();
            stops1.add(createStop("MG Road", 12.9758, 77.6033));
            stops1.add(createStop("Brigade Road", 12.9719, 77.6070));
            stops1.add(createStop("Jayanagar", 12.9308, 77.5839));
            route1.put("stops", stops1);
            routes.add(route1);

            // Load buses
            Map<String, Object> bus1 = new HashMap<>();
            bus1.put("id", 1);
            bus1.put("routeId", 1);
            bus1.put("currentStop", 1);
            bus1.put("lat", 12.9758);
            bus1.put("lng", 77.6033);
            bus1.put("speed", 40.0);
            bus1.put("status", "moving");
            buses.add(bus1);

        } catch (Exception e) {
            System.err.println("Error loading data: " + e.getMessage());
        }
    }

    private static Map<String, Object> createStop(String name, double lat, double lng) {
        Map<String, Object> stop = new HashMap<>();
        stop.put("name", name);
        stop.put("lat", lat);
        stop.put("lng", lng);
        return stop;
    }

    private static void displayRoutes() {
        System.out.println("\nRoutes:");
        for (Map<String, Object> route : routes) {
            System.out.println("ID: " + route.get("id") + ", Name: " + route.get("name"));
        }
    }

    private static void displayBuses() {
        System.out.println("\nBuses:");
        for (Map<String, Object> bus : buses) {
            System.out.println("ID: " + bus.get("id") + ", Route: " + bus.get("routeId") +
                             ", Status: " + bus.get("status"));
        }
    }

    // Method to calculate ETA (placeholder)
    public static String calculateETA(int busId) {
        Map<String, Object> bus = buses.stream()
                .filter(b -> (Integer) b.get("id") == busId)
                .findFirst()
                .orElse(null);

        if (bus == null) {
            return "Bus not found";
        }

        // Simple ETA calculation
        return "Approximately 10 minutes";
    }
}
