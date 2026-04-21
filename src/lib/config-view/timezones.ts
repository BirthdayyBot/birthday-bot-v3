export const TIMEZONE_REGIONS: Record<string, { label: string; emoji: string; prefixes: string[] }> = {
	africa: { label: 'Africa', emoji: '🌍', prefixes: ['africa/'] },
	americas: { label: 'Americas', emoji: '🌎', prefixes: ['america/'] },
	asia: { label: 'Asia', emoji: '🌏', prefixes: ['asia/'] },
	europe: { label: 'Europe', emoji: '🇪🇺', prefixes: ['europe/'] },
	pacific: { label: 'Pacific', emoji: '🌊', prefixes: ['pacific/'] },
	other: { label: 'Other', emoji: '🌐', prefixes: ['atlantic/', 'australia/', 'indian/', 'utc'] }
};
