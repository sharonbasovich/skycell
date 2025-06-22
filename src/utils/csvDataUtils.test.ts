import { parseCSVData, latLonTo3D } from "./csvDataUtils";

// Mock fetch for testing
global.fetch = jest.fn();

describe("CSV Data Utils", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("parseCSVData should parse valid CSV data", async () => {
    const mockCSV = `datetime,payload_callsign,lat,lon,alt,ascent_rate,batt,ext_humidity,ext_pressure,ext_temperature,frame,sats,speed,temp,upload_time,uploader_alt,uploader_callsign,software_name,software_version,frequency,modulation,baud_rate,snr,rssi,uploader_position,uploader_antenna,uploader_radio,time_received,raw
2025-06-21T18:11:10.000000Z,APEX-2-R,42.31576156616211,-71.12873840332031,17213,5.11,2.843137254901961,0,0.0,0.0,982,10,46,-6,2025-06-21T18:11:16.224297,0.0,W0MXX-HOME,horusdemodlib,0.3.13,432.630785,Horus Binary v2,,2.01,,"42.139362,-71.396149",Comet GP-3,HorusDemodLib + RTLSDR (432.630 MHz),2025-06-21T18:11:14.748354Z,5C03D603120B0A57432942EA418EC23D432E0AFA91FF01000000000000004440
2025-06-21T18:11:14.000000Z,APEX-2-R,42.315364837646484,-71.12837219238281,17236,5.6,2.843137254901961,0,0.0,0.0,983,10,58,-6,2025-06-21T18:11:20.344293,0.0,W0MXX-HOME,horusdemodlib,0.3.13,432.630787,Horus Binary v2,,5.76,,"42.139362,-71.396149",Comet GP-3,HorusDemodLib + RTLSDR (432.630 MHz),2025-06-21T18:11:19.277007Z,5C03D703120B0EEF422942BA418EC254433A0AFA91300200000000000000EA62`;

    (fetch as jest.Mock).mockResolvedValueOnce({
      text: () => Promise.resolve(mockCSV),
    });

    const result = await parseCSVData();

    expect(result.points).toHaveLength(2);
    expect(result.points[0]).toEqual({
      datetime: "2025-06-21T18:11:10.000000Z",
      latitude: 42.31576156616211,
      longitude: -71.12873840332031,
      altitude: 17213,
      ascent_rate: 5.11,
      speed: 46,
      temperature: -6,
      battery: 2.843137254901961,
    });
    expect(result.bounds.lat.min).toBe(42.315364837646484);
    expect(result.bounds.lat.max).toBe(42.31576156616211);
  });

  test("latLonTo3D should convert coordinates correctly", () => {
    const result = latLonTo3D(42.315, -71.128, 17213, 42.315, -71.128, 0.001);

    expect(result.x).toBeCloseTo(0, 2);
    expect(result.y).toBeCloseTo(17.213, 2);
    expect(result.z).toBeCloseTo(0, 2);
  });

  test("parseCSVData should handle empty data", async () => {
    const mockCSV =
      "datetime,payload_callsign,lat,lon,alt,ascent_rate,batt,ext_humidity,ext_pressure,ext_temperature,frame,sats,speed,temp,upload_time,uploader_alt,uploader_callsign,software_name,software_version,frequency,modulation,baud_rate,snr,rssi,uploader_position,uploader_antenna,uploader_radio,time_received,raw";

    (fetch as jest.Mock).mockResolvedValueOnce({
      text: () => Promise.resolve(mockCSV),
    });

    const result = await parseCSVData();

    expect(result.points).toHaveLength(0);
    expect(result.bounds.lat.min).toBe(0);
    expect(result.bounds.lat.max).toBe(0);
  });
});
