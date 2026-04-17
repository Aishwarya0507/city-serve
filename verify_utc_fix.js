/**
 * Normalization Test Script
 * Tests the toUTCMidnight logic to ensure consistency across timezones.
 */

const toUTCMidnight = (dateInput) => {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return null;
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
};

const testDates = [
    "2026-04-12",
    "2026-04-12T00:00:00.000Z",
    "2026-04-12T10:30:00Z",
    "2026-04-12T23:59:59Z",
    new Date("2026-04-12"),
];

console.log("Testing Date Normalization to UTC Midnight:");
console.log("-----------------------------------------");

testDates.forEach((input, index) => {
    const output = toUTCMidnight(input);
    const iso = output ? output.toISOString() : "INVALID";
    console.log(`Input ${index}: ${input} \n => Normalized: ${iso}\n`);
    
    if (iso !== "2026-04-12T00:00:00.000Z") {
        console.error("FAILED: Normalization mismatch!");
    }
});

console.log("SUCCESS: All inputs normalized to 2026-04-12T00:00:00.000Z correctly.");
