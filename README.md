<p align="center">
  <a href="https://tinygist.github.io"><img src="assets/img/tinygist-logo-dark-purple.svg" alt="tinyGist" width="520"></a>
</p>

<p align="center">
  <a href="https://tinygist.github.io"><img src="https://img.shields.io/badge/Project%20Page-tinygist.github.io-870074" alt="Project page"></a>
  <a href="https://doi.org/10.1145/3795866.3844490"><img src="https://img.shields.io/badge/Paper-ACM%20MobiCom%202026-870074" alt="Paper"></a>
  <a href="https://github.com/TinyGist/tinyGist"><img src="https://img.shields.io/badge/Artifact-TinyGist%2FtinyGist-870074" alt="Artifact repository"></a>
  <br>
  <img src="https://img.shields.io/badge/ACM-Artifacts%20Available-1C39BB" alt="ACM Artifacts Available">
  <img src="https://img.shields.io/badge/ACM-Artifacts%20Evaluated-00A693" alt="ACM Artifacts Evaluated">
  <img src="https://img.shields.io/badge/ACM-Results%20Reproduced-CA910D" alt="ACM Results Reproduced">
</p>

# tinyGist Project Page

Source of **[tinygist.github.io](https://tinygist.github.io)**, the project page for:

> **Adaptive Segmented Decentralized Federated Learning on Tiny Devices**<br>
> Navidreza Asadi¹, Lars Wulfert², Chi Xia¹, Halil Ibrahim Bengü¹, Hendrik Wöhrle²˒³, Wolfgang Kellerer¹<br>
> ¹Technical University of Munich, ²Fraunhofer IMS, ³University of Duisburg-Essen<br>
> ACM MobiCom 2026

tinyGist is a decentralized federated learning framework for microcontrollers. Instead of exchanging the entire model, each device shares only its *gist*: parameters are segmented by importance, segments are shared probabilistically, and receivers aggregate them weighted by the sender's accuracy. Across 8 models and 15 tasks, it converges 1.35–3.3× faster, is up to 17% more accurate, and needs ≈3× less communication than full-model decentralized FL.

## Links

| | |
|---|---|
| Project page | https://tinygist.github.io |
| Paper (ACM MobiCom 2026) | https://doi.org/10.1145/3795866.3844490 |
| Teaser video (90 s) | https://tinygist.github.io/#video |
| Artifact: code, configs, firmware | https://github.com/TinyGist/tinyGist |
| Artifact: container image | `ghcr.io/tinygist/tinygist-artifact-mobicom26:latest` |
| Earlier work: Gist (FLEdge-AI '25) | https://doi.org/10.1145/3737899.3768527 |
| Framework: Zwe³ (MobiCom '25 poster) | https://doi.org/10.1145/3680207.3765668 |

## Artifact

The artifact received all three ACM badges: **Artifacts Available**, **Artifacts Evaluated**, and **Results Reproduced**. It contains the simulation framework (PyTorch), the ESP32/QEMU emulation projects, the physical-device firmware (ESP32-S3, M5Stack Core2, ESP32-WROVER), the experiment configurations, and a notebook that reproduces the paper's figures from raw results.

```bash
docker pull ghcr.io/tinygist/tinygist-artifact-mobicom26:latest
docker run -it --name tinygist ghcr.io/tinygist/tinygist-artifact-mobicom26:latest
```

Requirements, replication steps for each figure and table, and estimated run times are in the [artifact README](https://github.com/TinyGist/tinyGist#readme).

## Citation

```bibtex
@inproceedings{asadi2026tinygist,
  author    = {Asadi, Navidreza and Wulfert, Lars and Xia, Chi and Beng{\"u}, Halil Ibrahim and W{\"o}hrle, Hendrik and Kellerer, Wolfgang},
  title     = {Adaptive Segmented Decentralized Federated Learning on Tiny Devices},
  booktitle = {Proceedings of the 32nd Annual International Conference on Mobile Computing and Networking},
  series    = {MobiCom '26},
  year      = {2026},
  month     = oct,
  location  = {Austin, TX, USA},
  publisher = {Association for Computing Machinery},
  address   = {New York, NY, USA},
  isbn      = {9798400725050},
  doi       = {10.1145/3795866.3844490}
}

@inproceedings{asadi2025gist,
  author    = {Asadi, Navidreza and Beng{\"u}, Halil Ibrahim and Wulfert, Lars and W{\"o}hrle, Hendrik and Kellerer, Wolfgang},
  title     = {{Gist} - Optimizing Segmentation for Decentralized Federated Learning on Tiny Devices},
  booktitle = {Proceedings of the Federated Learning and Edge AI for Privacy and Mobility},
  series    = {FLEdge-AI '25},
  year      = {2025},
  pages     = {77--84},
  publisher = {Association for Computing Machinery},
  address   = {New York, NY, USA},
  isbn      = {9798400719769},
  doi       = {10.1145/3737899.3768527}
}

@inproceedings{asadi2025zwe3,
  author    = {Asadi, Navidreza and Beng{\"u}, Halil Ibrahim and Wulfert, Lars and W{\"o}hrle, Hendrik and Kellerer, Wolfgang},
  title     = {Road to Tiny Reality: Digital Twins for Decentralized {AI} on Microcontrollers},
  booktitle = {Proceedings of the 31st Annual International Conference on Mobile Computing and Networking},
  series    = {MobiCom '25},
  year      = {2025},
  pages     = {1305--1307},
  publisher = {Association for Computing Machinery},
  address   = {New York, NY, USA},
  doi       = {10.1145/3680207.3765668}
}
```

## About This Repository

A static site with no build step and no framework, served by GitHub Pages from `main`.

```text
index.html                 page content
style.css                  styles (fonts: Bricolage Grotesque, IBM Plex Sans/Mono via Google Fonts)
main.js                    hero animation, Gist Lab, pillar highlights, counters, copy buttons
assets/img/                logo, favicon, temple, setup photo, social-preview image (og.jpg)
assets/fig/                paper figures converted to dark-background SVGs
assets/video/              teaser (MP4), English subtitles (WebVTT), poster frame
.nojekyll                  tells GitHub Pages to serve files as-is
```

**Preview locally**

```bash
python3 -m http.server 8000
# open http://127.0.0.1:8000
```

Opening `index.html` directly also works, but some browsers then block the subtitle track.

**Update the teaser:** replace `assets/video/tinygist-teaser.mp4` and `assets/video/tinygist-teaser.en.vtt` (WebVTT: an `.srt` file with a `WEBVTT` first line and `,` → `.` in timestamps). If the title card changes, also refresh `assets/video/poster.jpg` (1920×1080) and `assets/img/og.jpg` (1200×630).

**Gist Lab:** the interactive demo follows the artifact's defaults: 3 segments of equal size by parameter magnitude, segment probability proportional to mean magnitude, 6 sends per round to random peers, and aggregation once 5 segments have arrived. These constants are at the top of the Gist Lab block in `main.js`.

## License

The website code is released under the [MIT License](LICENSE). Paper figures, photos, and the teaser video are by the authors.
