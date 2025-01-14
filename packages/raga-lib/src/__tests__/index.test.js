const native = require("@adahiya/raga-lib-native");

describe("raga-lib-native", () => {
  test("native bindings exist", () => {
    expect(native).toBeDefined();
  });

  test("convertSwinsianToItunesXml is callable", () => {
    const tracks = [];
    const playlists = [];
    const result = native.convertSwinsianToItunesXml(tracks, playlists);
    expect(result).toBeDefined();
  });
});
