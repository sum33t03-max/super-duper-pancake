# Drone Technology Project: PID Control and Guidance Demonstrations

This notebook was individually completed as part of the India Space Lab internship. It contains two interactive educational demonstrations.

## Notebook contents

1. **Drone altitude PID demonstration:** interactive proportional, integral and derivative gain controls, wind-noise magnitude, a simplified one-dimensional altitude response and an altitude animation.
2. **Autonomous boat guidance demonstration:** a separate two-dimensional path-following example using position-error feedback, velocity damping, environmental current terms, interactive parameters and animation.

## Technologies

Python 3, NumPy, Matplotlib, Matplotlib animation, IPython display and ipywidgets.

## Run

```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\\Scripts\\activate
python -m pip install -r requirements.txt
jupyter notebook notebooks/altitude-pid-and-boat-guidance.ipynb
```

Google Colab is also suitable. The notebook uses interactive widgets and embedded animations, so run it in order in a Jupyter environment with ipywidgets enabled.

## Scope and limitations

The drone portion models a one-dimensional vertical state (altitude and vertical velocity) with a simplified PID-controlled acceleration and random disturbance. It does not model 3D translation, roll, pitch, yaw dynamics, rotor mixing, motor dynamics or a complete six-degree-of-freedom quadcopter rigid-body system.

The boat portion is a distinct two-dimensional guidance example. It is not a drone subsystem. The notebook was executed cell-by-cell and subsequently with a fresh-runtime sequential Run All in Google Colab, as confirmed by the author.

The notebook is presented according to its actual contents rather than implying that it implements a complete 6-DOF drone model.

## Attribution

Individually completed by Sumeet Singh during the India Space Lab internship. NumPy, Matplotlib, IPython and ipywidgets are third-party open-source projects and remain subject to their respective licenses.
