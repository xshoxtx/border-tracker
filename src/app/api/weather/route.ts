import { NextResponse } from "next/server";

// Border crossing GPS coords
const BORDER_WEATHER: Record<string, { lat: number; lng: number; label: string }> = {
    "sungai-tujuh": { lat: 4.5852, lng: 114.0723, label: "Sungai Tujuh" },
    "kuala-lurah": { lat: 4.7407, lng: 114.8135, label: "Kuala Lurah" },
    "ujung-jalan": { lat: 4.6890, lng: 115.0393, label: "Ujung Jalan" },
    "mengkalap": { lat: 4.7933, lng: 115.2363, label: "Mengkalap" },
};

// WMO weather code → description + emoji
function weatherInfo(code: number): { description: string; emoji: string } {
    const map: Record<number, { description: string; emoji: string }> = {
        0: { description: "Clear sky", emoji: "☀️" },
        1: { description: "Mainly clear", emoji: "🌤️" },
        2: { description: "Partly cloudy", emoji: "⛅" },
        3: { description: "Overcast", emoji: "☁️" },
        45: { description: "Foggy", emoji: "🌫️" },
        48: { description: "Rime fog", emoji: "🌫️" },
        51: { description: "Light drizzle", emoji: "🌦️" },
        53: { description: "Moderate drizzle", emoji: "🌦️" },
        55: { description: "Dense drizzle", emoji: "🌧️" },
        61: { description: "Slight rain", emoji: "🌧️" },
        63: { description: "Moderate rain", emoji: "🌧️" },
        65: { description: "Heavy rain", emoji: "🌧️" },
        80: { description: "Slight showers", emoji: "🌦️" },
        81: { description: "Moderate showers", emoji: "🌧️" },
        82: { description: "Violent showers", emoji: "⛈️" },
        95: { description: "Thunderstorm", emoji: "⛈️" },
        96: { description: "Thunderstorm with hail", emoji: "⛈️" },
        99: { description: "Thunderstorm with hail", emoji: "⛈️" },
    };
    return map[code] || { description: "Unknown", emoji: "🌤️" };
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const border = searchParams.get("border") || "sungai-tujuh";

    const loc = BORDER_WEATHER[border];
    if (!loc) {
        return NextResponse.json({ success: false, error: "Unknown border" }, { status: 400 });
    }

    try {
        // Open-Meteo: free, no API key, reliable
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,visibility&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia/Kuching&forecast_days=1`;

        const res = await fetch(url, { next: { revalidate: 1800 } });
        if (!res.ok) throw new Error(`Open-Meteo returned ${res.status}`);

        const data = await res.json();
        const current = data.current;
        const daily = data.daily;

        const info = weatherInfo(current.weather_code);
        const rainChance = daily.precipitation_probability_max?.[0] || 0;

        return NextResponse.json({
            success: true,
            border: loc.label,
            weather: {
                temp: Math.round(current.temperature_2m),
                feelsLike: Math.round(current.apparent_temperature),
                humidity: Math.round(current.relative_humidity_2m),
                description: info.description,
                emoji: info.emoji,
                wind: Math.round(current.wind_speed_10m),
                visibility: current.visibility ? Math.round(current.visibility / 1000) : 10,
                high: Math.round(daily.temperature_2m_max[0]),
                low: Math.round(daily.temperature_2m_min[0]),
                rainChance,
                rainWarning: rainChance >= 60,
            },
        });
    } catch (err) {
        console.error("Weather API error:", err);
        return NextResponse.json(
            { success: false, error: "Failed to fetch weather" },
            { status: 500 }
        );
    }
}
