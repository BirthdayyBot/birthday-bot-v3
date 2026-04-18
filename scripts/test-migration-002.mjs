// Quick test for the resolveIana logic used in migration 002
import { getTimeZone } from '../src/lib/utilities/tz.js';

const FALLBACK_IANA = 'Europe/London';

const OFFSET_TO_IANA = {
	[-11]: 'Pacific/Apia',
	[-10]: 'Pacific/Honolulu',
	[-9]: 'America/Anchorage',
	[-8]: 'America/Los_Angeles',
	[-7]: 'America/Denver',
	[-6]: 'America/Chicago',
	[-5]: 'America/New_York',
	[-4]: 'America/Caracas',
	[-3]: 'America/Argentina/Buenos_Aires',
	[-2]: 'Atlantic/South_Georgia',
	[-1]: 'Atlantic/Azores',
	[0]: 'Europe/London',
	[1]: 'Europe/Paris',
	[2]: 'Europe/Berlin',
	[3]: 'Europe/Moscow',
	[4]: 'Asia/Dubai',
	[5]: 'Asia/Karachi',
	[6]: 'Asia/Dhaka',
	[7]: 'Asia/Jakarta',
	[8]: 'Asia/Shanghai',
	[9]: 'Asia/Tokyo',
	[10]: 'Australia/Brisbane',
	[11]: 'Pacific/Noumea',
	[12]: 'Pacific/Fiji',
};

function resolveIana(timezone) {
	const hours = parseInt(timezone, 10);
	const candidate = isNaN(hours) ? timezone : (OFFSET_TO_IANA[hours] ?? FALLBACK_IANA);
	return getTimeZone(candidate) ? candidate : FALLBACK_IANA;
}

let passed = 0;
let failed = 0;

function assert(label, actual, expected) {
	if (actual === expected) {
		console.log(`  ✓ ${label}`);
		passed++;
	} else {
		console.error(`  ✗ ${label}: expected "${expected}", got "${actual}"`);
		failed++;
	}
}

// 1. All OFFSET_TO_IANA entries must resolve to themselves (all are valid IANA names)
console.log('\n[1] All OFFSET_TO_IANA values are valid in the timezone registry:');
for (const [offset, iana] of Object.entries(OFFSET_TO_IANA)) {
	assert(`offset ${offset} → ${iana}`, resolveIana(String(offset)), iana);
}

// 2. Integer strings round-trip correctly
console.log('\n[2] Integer string inputs resolve to expected IANA names:');
assert('"-5" → America/New_York', resolveIana('-5'), 'America/New_York');
assert('"0" → Europe/London', resolveIana('0'), 'Europe/London');
assert('"9" → Asia/Tokyo', resolveIana('9'), 'Asia/Tokyo');

// 3. Unknown offset falls back to Europe/London
console.log('\n[3] Unknown offsets fall back to Europe/London:');
assert('"99" → Europe/London', resolveIana('99'), FALLBACK_IANA);
assert('"-99" → Europe/London', resolveIana('-99'), FALLBACK_IANA);

// 4. Invalid non-numeric string falls back to Europe/London
console.log('\n[4] Invalid IANA strings fall back to Europe/London:');
assert('"garbage" → Europe/London', resolveIana('garbage'), FALLBACK_IANA);
assert('"UTC+5" → Europe/London', resolveIana('UTC+5'), FALLBACK_IANA);

// 5. Already-valid IANA strings pass through unchanged (idempotent re-run safety)
console.log('\n[5] Existing valid IANA strings pass through unchanged (idempotent):');
assert('"Europe/London" → Europe/London', resolveIana('Europe/London'), 'Europe/London');
assert('"Asia/Tokyo" → Asia/Tokyo', resolveIana('Asia/Tokyo'), 'Asia/Tokyo');
assert('"America/New_York" → America/New_York', resolveIana('America/New_York'), 'America/New_York');

console.log(`\n${passed + failed} tests: ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
