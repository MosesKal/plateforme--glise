import assert from "node:assert/strict"
import { beforeEach, describe, it } from "node:test"
import { isLiveRadioPlaying, usePlayerStore } from "./player.store.ts"

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
