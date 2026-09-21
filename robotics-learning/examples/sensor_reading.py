"""A hardware-free first step toward understanding sensor input."""

SAFE_DISTANCE_CM = 20


def interpret_distance(distance_cm: float) -> str:
    """Return a simple action for a simulated distance reading."""
    if distance_cm < SAFE_DISTANCE_CM:
        return "Obstacle is close; slow down and check the path."
    return "Path looks clear; continue carefully."


def main() -> None:
    simulated_readings_cm = [42.0, 27.5, 15.0, 31.0]

    for distance_cm in simulated_readings_cm:
        message = interpret_distance(distance_cm)
        print(f"Distance: {distance_cm:>4.1f} cm | {message}")


if __name__ == "__main__":
    main()
