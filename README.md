# SoulReaper Robotics

Hi, I’m **SoulReaper1246**. I’m a beginner programmer learning how software and hardware work together through robotics engineering, while also exploring web development. This README is the main presentation for my learning repository: a place to document small experiments, share what I’m practicing, and improve one project at a time. While also using ai to help me on my journey and would love it if maybe someone else joined me on. My journey and helped me out.

I’m not presenting myself as an expert. I’m building fundamentals, asking questions, and keeping the projects here small enough to understand and explain.

## Start here

Read this README first to understand what I’m learning, what I want to try next, and how I document progress. The folders below are supporting material rather than a separate portfolio website.

- [Robotics learning area](robotics-learning/): the main hands-on learning area, with beginner notes and a tiny Python sensor-reading simulation to expand later.
- [Web starter](web-starter/): a secondary HTML/CSS practice project, kept small so I can focus on learning fundamentals.
- [Soulreaper's To Do list](todo-app/): my first project built with GitHub Copilot and AI support.
- [Learning roadmap](#learning-roadmap): the skills I’m working toward next.

## Soulreaper's To Do list

This is my first project using GitHub Copilot/AI. It is a local-first to-do app that helps me practice building a complete, useful web project while learning how AI can support the development process.

**Current release: 0.1.0**

The app supports two ways to work:

- **Build your own lists:** create multiple named lists, add tasks, edit them, complete them, delete them, filter them, and save everything locally.
- **Improve an existing file:** import a text file, CSV, JSON file, Word document, spreadsheet, or PowerPoint presentation. The app scans readable content locally, points out areas that may need improvement, explains how to fix them, and creates specific follow-up tasks.

It also includes multiple languages, private local profiles with PIN protection, and read-only sharing links so someone can view a list without editing it. The project is dependency-free and can be opened directly from [`todo-app/index.html`](todo-app/index.html).

See the [`todo-app/README.md`](todo-app/README.md) file for the purpose of each source file and guidance for making human-friendly edits.

## Current skills and technologies

| Area | Learning now |
| --- | --- |
| Programming | Python fundamentals, problem solving, and readable code |
| Web | HTML, CSS, responsive layout, and basic accessibility |
| Robotics | Sensors, actuators, control loops, electronics vocabulary, and safe experimentation |
| Tools | Git, GitHub, command line basics, and documenting experiments |

## Learning roadmap

### Foundations

- [ ] Practice Python functions, lists, dictionaries, and modules.
- [ ] Learn to write small tests and debug with useful print statements or a debugger.
- [ ] Use Git branches and focused commits for each experiment.

### Web development (secondary learning track)

- [ ] Add a small JavaScript interaction to the web starter.
- [ ] Learn semantic HTML, keyboard navigation, and accessible color contrast.
- [ ] Build a simple project page for each finished experiment.

### Robotics

- [ ] Understand voltage, current, resistance, and common component names.
- [ ] Read sensor data from a microcontroller or robotics simulator.
- [ ] Build a feedback loop that changes an actuator based on sensor input.
- [ ] Record wiring, assumptions, results, and next steps for every experiment.

## Project ideas

These are intentionally approachable projects that can grow with my skills:

1. **Line-following robot notes** — document the sensors, control logic, and tuning process.
2. **Room environment dashboard** — display simulated or real temperature and light readings in a small web page.
3. **LED reaction timer** — combine a button, an LED, and a timer while practicing input validation.
4. **Robot parts catalog** — create a searchable page for components and what each one does.
5. **Obstacle-alert prototype** — use distance readings to trigger a clear visual or audio warning.

## Contributing and learning notes

This is a personal learning repository, but friendly suggestions are welcome. If you spot a typo or have a beginner-safe improvement:

1. Open an issue describing the suggestion and why it would help.
2. Keep changes small and explain what you learned.
3. Avoid adding credentials, private data, or hardware-specific instructions that could be unsafe.

When I learn something new, I try to record:

- **Goal:** what I expected to learn.
- **Setup:** tools, versions, and hardware or simulated inputs.
- **Result:** what worked and what did not.
- **Next step:** the smallest useful experiment to try next.

## Run the learning examples

### Secondary web starter

The [`web-starter/`](web-starter/) folder is only a small web-development practice project; it is not the main presentation for this repository. Open [`web-starter/index.html`](web-starter/index.html) directly in a browser, or serve the repository with any simple local web server. No package installation is required.

### Robotics learning example

The simulation uses only the Python standard library. From the repository root, run:

```text
python robotics-learning/examples/sensor_reading.py
```

It prints a few simulated distance readings and a beginner-friendly interpretation. It does not connect to hardware.

## License

This repository is shared for learning and documentation purposes. Individual examples are provided as-is so they can be studied and expanded.
