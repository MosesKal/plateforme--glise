import assert from "node:assert/strict"
import { beforeEach, describe, it } from "node:test"
import { isLiveRadioPlaying, usePlayerStore } from "./player.store.ts"
import {
  DEFAULT_PLAYER_VOLUME,
  normalizePlayerVolume,
  playerVolumeLevel,
  playerVolumePercent,
  readStoredPlayerVolume,
} from "../components/features/teachings/player/volume.ts"

const station = {
  id: "radio-1",
  nameFr: "Radio CECJC",
  nameEn: null,
  descriptionFr: null,
  descriptionEn: null,
  streamUrl: "https://stream.zeno.fm/t2utmgpt1m6tv",
  websiteUrl: null,
  coverImage: null,
}

const teaching = {
  id: "teaching-1",
  slug: "enseignement",
  title: "Enseignement",
  durationSec: 120,
  fileSize: 1,
  fileUrl: "https://example.test/audio.mp3",
  playCount: 0,
  position: 0,
  createdAt: "2026-07-24T00:00:00.000Z",
  theme: { id: "theme-1", slug: "theme", nameFr: "Thème" },
  speaker: { id: "speaker-1", slug: "orateur", fullName: "Orateur" },
  tags: [],
}

describe("player store", () => {
  beforeEach(() => usePlayerStore.getState().close())

  it("bascule d’un enseignement vers la radio sans conserver la file", () => {
    usePlayerStore.getState().play(teaching, [teaching])
    usePlayerStore.getState().playRadio(station)

    const state = usePlayerStore.getState()
    assert.deepEqual(state.source, { type: "live-radio", station })
    assert.deepEqual(state.queue, [])
    assert.equal(state.playbackState, "connecting")
  })

  it("bascule de la radio vers un enseignement", () => {
    usePlayerStore.getState().playRadio(station)
    usePlayerStore.getState().play(teaching, [teaching])

    assert.deepEqual(usePlayerStore.getState().source, {
      type: "teaching",
      teaching,
    })
  })

  it("n’active les animations live que pendant une lecture réelle", () => {
    const source = { type: "live-radio", station }
    assert.equal(isLiveRadioPlaying(source, "connecting", station.id), false)
    assert.equal(isLiveRadioPlaying(source, "paused", station.id), false)
    assert.equal(isLiveRadioPlaying(source, "error", station.id), false)
    assert.equal(isLiveRadioPlaying(source, "playing", station.id), true)
  })
})

describe("volume du player", () => {
  it("utilise 80 % lorsqu'aucune préférence n'est enregistrée", () => {
    assert.equal(readStoredPlayerVolume(null), DEFAULT_PLAYER_VOLUME)
    assert.equal(readStoredPlayerVolume(""), DEFAULT_PLAYER_VOLUME)
  })

  it("normalise toujours le volume entre 0 et 100 %", () => {
    assert.equal(normalizePlayerVolume(-0.25), 0)
    assert.equal(normalizePlayerVolume(1.25), 1)
    assert.equal(playerVolumePercent(1), 100)
  })

  it("synchronise le niveau de l'icône avec la valeur du curseur", () => {
    assert.equal(playerVolumeLevel(0), "muted")
    assert.equal(playerVolumeLevel(0.25), "low")
    assert.equal(playerVolumeLevel(0.8), "high")
  })
})
