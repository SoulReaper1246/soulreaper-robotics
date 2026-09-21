# Robotics learning area

This folder is for beginner-friendly robotics notes and experiments. The goal is to understand one concept at a time before connecting code to physical hardware.

## Starter example

[`examples/sensor_reading.py`](examples/sensor_reading.py) simulates distance readings. It demonstrates a small, reusable function, a decision based on a threshold, and a simple main program.

Run it from the repository root:

```text
python robotics-learning/examples/sensor_reading.py
```

The output is intentionally predictable and uses no hardware, drivers, or third-party packages.

## Safe expansion ideas

- Replace the simulated list with readings from a simulator.
- Add tests for the `interpret_distance` function.
- Record units and expected sensor limits.
- Add a wiring diagram only after checking the specific board and component documentation.
- Keep an experiment log with the goal, setup, result, and next step.

## Concepts to learn next

- Digital versus analog signals
- Sensor noise and averaging
- Motors and actuators
- Feedback and control loops
- Power, grounding, and safe current limits
