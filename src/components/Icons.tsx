/**
 * Ride Fleet icon system — 52 symbols on a 24x24 grid, 1.5px stroke,
 * round caps and joins, `currentColor`. Generated from
 * site-v2/_system/icons.html.
 *
 * Rules (enforced by review, not by the type system):
 *   - Icons are DECORATIVE. `<Icon>` renders `aria-hidden` and `focusable=false`.
 *     Meaning lives in adjacent text; if an icon is the only label on a control,
 *     give that control an `<VisuallyHidden>` name.
 *   - Size with CSS width/height, never by changing the viewBox.
 *   - No emoji anywhere on this site. This sprite is the whole icon system.
 */

export type IconName =
  | 'i-vehicle'
  | 'i-key'
  | 'i-calendar'
  | 'i-clock'
  | 'i-road'
  | 'i-gauge'
  | 'i-wrench'
  | 'i-route'
  | 'i-toll-gantry'
  | 'i-receipt'
  | 'i-dollar'
  | 'i-chart'
  | 'i-trend'
  | 'i-camera'
  | 'i-clipboard'
  | 'i-shield'
  | 'i-lock'
  | 'i-layers'
  | 'i-phone'
  | 'i-mic'
  | 'i-waveform'
  | 'i-message'
  | 'i-sms'
  | 'i-mail'
  | 'i-robot'
  | 'i-user'
  | 'i-users'
  | 'i-building'
  | 'i-location'
  | 'i-globe'
  | 'i-search'
  | 'i-filter'
  | 'i-grid'
  | 'i-check'
  | 'i-check-circle'
  | 'i-x'
  | 'i-alert'
  | 'i-info'
  | 'i-arrow-right'
  | 'i-arrow-up-right'
  | 'i-chevron'
  | 'i-chevron-down'
  | 'i-plus'
  | 'i-minus'
  | 'i-external'
  | 'i-sparkle'
  | 'i-refresh'
  | 'i-download'
  | 'i-bell'
  | 'i-link'
  | 'i-bolt'
  | 'i-menu';

export const ICON_NAMES: IconName[] = [
  'i-vehicle',
  'i-key',
  'i-calendar',
  'i-clock',
  'i-road',
  'i-gauge',
  'i-wrench',
  'i-route',
  'i-toll-gantry',
  'i-receipt',
  'i-dollar',
  'i-chart',
  'i-trend',
  'i-camera',
  'i-clipboard',
  'i-shield',
  'i-lock',
  'i-layers',
  'i-phone',
  'i-mic',
  'i-waveform',
  'i-message',
  'i-sms',
  'i-mail',
  'i-robot',
  'i-user',
  'i-users',
  'i-building',
  'i-location',
  'i-globe',
  'i-search',
  'i-filter',
  'i-grid',
  'i-check',
  'i-check-circle',
  'i-x',
  'i-alert',
  'i-info',
  'i-arrow-right',
  'i-arrow-up-right',
  'i-chevron',
  'i-chevron-down',
  'i-plus',
  'i-minus',
  'i-external',
  'i-sparkle',
  'i-refresh',
  'i-download',
  'i-bell',
  'i-link',
  'i-bolt',
  'i-menu',
];

/** Renders the sprite once. Mount as the first child of <body>. */
export function IconSprite() {
  return (
    <svg
      width={0}
      height={0}
      aria-hidden="true"
      focusable="false"
      style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
    >
      <defs>
    {/* ============ FLEET ============ */}
    <symbol id="i-vehicle" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 13.5 6 8.2A2 2 0 0 1 7.9 6.8h8.2A2 2 0 0 1 18 8.2l1.5 5.3"/>
      <path d="M3.5 13.5h17v3.2a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1z"/>
      <circle cx="7.2" cy="17.7" r="1.4"/><circle cx="16.8" cy="17.7" r="1.4"/>
      <path d="M6 10.6h12"/>
    </symbol>

    <symbol id="i-key" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7.6" cy="16.4" r="3.6"/>
      <path d="m10.2 13.8 8.4-8.4"/>
      <path d="m16.2 7.8 2.2 2.2M18.6 5.4l2 2"/>
    </symbol>

    <symbol id="i-calendar" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.8" y="5.2" width="16.4" height="15" rx="2.2"/>
      <path d="M3.8 9.8h16.4M8.2 3.4v3.4M15.8 3.4v3.4"/>
    </symbol>

    <symbol id="i-clock" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8.4"/><path d="M12 7.4V12l3 1.8"/>
    </symbol>

    <symbol id="i-road" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7.4 3.8 4.6 20.2"/><path d="m16.6 3.8 2.8 16.4"/>
      <path d="M12 4.4v2.8M12 10.6v2.8M12 16.8v2.8"/>
    </symbol>

    <symbol id="i-gauge" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 17.4a8.4 8.4 0 1 1 16 0"/>
      <path d="m12 12.6 3.8-3.4"/><circle cx="12" cy="13.6" r="1.3"/>
      <path d="M4 17.4h2M18 17.4h2M12 5.6v1.8"/>
    </symbol>

    <symbol id="i-wrench" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15.3 4.2a5 5 0 0 0-6.1 6.6l-5 5a1.8 1.8 0 0 0 2.5 2.5l5-5a5 5 0 0 0 6.6-6.1l-2.7 2.7-2.6-.7-.7-2.6Z"/>
    </symbol>

    <symbol id="i-route" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="18.4" r="2.4"/><circle cx="18" cy="5.6" r="2.4"/>
      <path d="M15.6 5.6H9.8a3.4 3.4 0 0 0 0 6.8h4.4a3.4 3.4 0 0 1 0 6.8H8.4"/>
    </symbol>

    {/* ============ TOLLS & MONEY ============ */}
    <symbol id="i-toll-gantry" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.4 6.2h17.2"/><path d="M5.4 6.2v14M18.6 6.2v14"/>
      <path d="M9 6.2v3.2h6V6.2"/>
      <path d="M8.2 13.4h7.6"/><path d="M12 6.2V3.6"/>
    </symbol>

    <symbol id="i-receipt" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5.5 3.6h13v17.2l-2.2-1.5-2.1 1.5-2.2-1.5-2.2 1.5-2.1-1.5-2.2 1.5Z"/>
      <path d="M9 8.4h6M9 12.4h6"/>
    </symbol>

    <symbol id="i-dollar" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3.4v17.2"/>
      <path d="M15.8 7.2a3.4 3.4 0 0 0-3.4-2.2h-.9a3.1 3.1 0 0 0 0 6.2h1.2a3.1 3.1 0 0 1 0 6.2h-1a3.4 3.4 0 0 1-3.5-2.3"/>
    </symbol>

    <symbol id="i-chart" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20.2h16"/>
      <path d="M6.6 20.2v-6.4M11 20.2V8M15.4 20.2v-8.6M19.8 20.2V4.6"/>
    </symbol>

    <symbol id="i-trend" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m4 15.6 5-5 3.5 3.5L20 6.6"/><path d="M15.2 6.6H20v4.8"/>
    </symbol>

    {/* ============ OPERATIONS ============ */}
    <symbol id="i-camera" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.6 8.6a1.8 1.8 0 0 1 1.8-1.8h1.9l1.3-2.2h6.8l1.3 2.2h1.9a1.8 1.8 0 0 1 1.8 1.8v9a1.8 1.8 0 0 1-1.8 1.8H5.4a1.8 1.8 0 0 1-1.8-1.8Z"/>
      <circle cx="12" cy="12.8" r="3.4"/>
    </symbol>

    <symbol id="i-clipboard" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 4.5H7.2a1.7 1.7 0 0 0-1.7 1.7v12.6a1.7 1.7 0 0 0 1.7 1.7h9.6a1.7 1.7 0 0 0 1.7-1.7V6.2A1.7 1.7 0 0 0 16.8 4.5H15"/>
      <rect x="9" y="2.8" width="6" height="3.4" rx="1.2"/>
      <path d="m9.4 13 1.9 1.9 3.5-3.7"/>
    </symbol>

    <symbol id="i-shield" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3.2 5 6v5.4c0 4.2 2.9 7.5 7 9.4 4.1-1.9 7-5.2 7-9.4V6Z"/>
      <path d="m9.2 12 2 2 3.6-3.8"/>
    </symbol>

    <symbol id="i-lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4.8" y="10.4" width="14.4" height="9.8" rx="2.2"/>
      <path d="M8.2 10.4V7.8a3.8 3.8 0 0 1 7.6 0v2.6"/>
      <path d="M12 14.2v2.4"/>
    </symbol>

    <symbol id="i-layers" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3.4 8.4 4.3L12 12 3.6 7.7Z"/>
      <path d="m3.6 12.2 8.4 4.3 8.4-4.3M3.6 16.5 12 20.8l8.4-4.3"/>
    </symbol>

    {/* ============ VOICE & MESSAGING ============ */}
    <symbol id="i-phone" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 4.4H5.6A1.8 1.8 0 0 0 3.8 6.3c0 8 6 14 13.9 14a1.8 1.8 0 0 0 1.8-1.8v-2.4l-4-1.6-2 2a11.6 11.6 0 0 1-5.7-5.7l2-2Z"/>
    </symbol>

    <symbol id="i-mic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9.2" y="3.2" width="5.6" height="10" rx="2.8"/>
      <path d="M5.8 11.2a6.2 6.2 0 0 0 12.4 0"/>
      <path d="M12 17.4v3.1M8.8 20.8h6.4"/>
    </symbol>

    <symbol id="i-waveform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.4 10.4v3.2M7 6.6v10.8M10.6 9v6M14.2 4.4v15.2M17.8 8.2v7.6M21.4 10.8v2.4"/>
    </symbol>

    <symbol id="i-message" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.2 12.4a7.6 7.6 0 0 1-8.2 7.6 8.6 8.6 0 0 1-3-.6L4 20.4l1.2-4.6a7.4 7.4 0 0 1-1-3.8 7.6 7.6 0 0 1 8-7.6 7.7 7.7 0 0 1 8 8Z"/>
    </symbol>

    <symbol id="i-sms" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.8 6.6a2 2 0 0 1 2-2h12.4a2 2 0 0 1 2 2v8.2a2 2 0 0 1-2 2H9.4L5.2 20.4v-3.6h-1.4Z"/>
      <path d="M8.6 9.4h6.8M8.6 12.6h4.4"/>
    </symbol>

    <symbol id="i-mail" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.4" y="5.4" width="17.2" height="13.2" rx="2.2"/>
      <path d="m3.8 7.4 7.1 5a2 2 0 0 0 2.2 0l7.1-5"/>
    </symbol>

    <symbol id="i-robot" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4.2" y="8" width="15.6" height="11.4" rx="2.6"/>
      <path d="M12 4.2V8"/><circle cx="12" cy="3.2" r="1.2"/>
      <path d="M9.4 12.4v1.8M14.6 12.4v1.8"/>
      <path d="M9.8 16.6h4.4"/>
      <path d="M4.2 12.4H2.6M21.4 12.4h-1.6"/>
    </symbol>

    {/* ============ PEOPLE & PLACES ============ */}
    <symbol id="i-user" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8.2" r="3.6"/><path d="M4.8 20a7.2 7.2 0 0 1 14.4 0"/>
    </symbol>

    <symbol id="i-users" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9.5" cy="8.4" r="3.3"/><path d="M3.8 19.4a5.9 5.9 0 0 1 11.4 0"/>
      <path d="M16.2 5.6a3.1 3.1 0 0 1 0 5.6M17.4 14.2a5.6 5.6 0 0 1 3 4.6"/>
    </symbol>

    <symbol id="i-building" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20.3h16"/>
      <path d="M5.8 20.3V5.4A1.4 1.4 0 0 1 7.2 4h5.6a1.4 1.4 0 0 1 1.4 1.4v14.9"/>
      <path d="M14.2 20.3V9.8h3.6a1.4 1.4 0 0 1 1.4 1.4v9.1"/>
      <path d="M8.6 7.6h2.8M8.6 11h2.8M8.6 14.4h2.8"/>
    </symbol>

    <symbol id="i-location" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 10.4c0 5-7 10.6-7 10.6s-7-5.6-7-10.6a7 7 0 0 1 14 0Z"/>
      <circle cx="12" cy="10.2" r="2.5"/>
    </symbol>

    <symbol id="i-globe" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8.4"/><path d="M3.6 12h16.8"/>
      <path d="M12 3.6c2.1 2.3 3.3 5.3 3.3 8.4s-1.2 6.1-3.3 8.4c-2.1-2.3-3.3-5.3-3.3-8.4S9.9 5.9 12 3.6Z"/>
    </symbol>

    {/* ============ INTERFACE ============ */}
    <symbol id="i-search" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10.8" cy="10.8" r="6.3"/><path d="m15.4 15.4 4.1 4.1"/>
    </symbol>

    <symbol id="i-filter" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 6.2h15M7 12h10M10 17.8h4"/>
    </symbol>

    <symbol id="i-grid" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.8" y="3.8" width="7" height="7" rx="1.8"/><rect x="13.2" y="3.8" width="7" height="7" rx="1.8"/>
      <rect x="3.8" y="13.2" width="7" height="7" rx="1.8"/><rect x="13.2" y="13.2" width="7" height="7" rx="1.8"/>
    </symbol>

    <symbol id="i-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m5 12.6 4.6 4.6L19 6.8"/>
    </symbol>

    <symbol id="i-check-circle" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8.4"/><path d="m8.2 12.2 2.6 2.6 5-5.2"/>
    </symbol>

    <symbol id="i-x" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.4 6.4 17.6 17.6M17.6 6.4 6.4 17.6"/>
    </symbol>

    <symbol id="i-alert" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.6 4.3 3.3 17a1.6 1.6 0 0 0 1.4 2.4h14.6a1.6 1.6 0 0 0 1.4-2.4L13.4 4.3a1.6 1.6 0 0 0-2.8 0Z"/>
      <path d="M12 9.6v3.6M12 16.4h.01"/>
    </symbol>

    <symbol id="i-info" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8.4"/><path d="M12 11.2v4.6M12 8.2h.01"/>
    </symbol>

    <symbol id="i-arrow-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 12h14"/><path d="m13 6.5 5.5 5.5L13 17.5"/>
    </symbol>

    <symbol id="i-arrow-up-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.8 17.2 17.2 6.8"/><path d="M8.6 6.8h8.6v8.6"/>
    </symbol>

    <symbol id="i-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9.5 5.5 6.5 6.5-6.5 6.5"/>
    </symbol>

    <symbol id="i-chevron-down" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m5.5 9.5 6.5 6.5 6.5-6.5"/>
    </symbol>

    <symbol id="i-plus" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5.5v13M5.5 12h13"/>
    </symbol>

    <symbol id="i-minus" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5.5 12h13"/>
    </symbol>

    <symbol id="i-external" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 4.5h5.5V10"/><path d="M19.5 4.5 11 13"/>
      <path d="M18.2 14v4.3a1.7 1.7 0 0 1-1.7 1.7H5.7A1.7 1.7 0 0 1 4 18.3V7.5a1.7 1.7 0 0 1 1.7-1.7H10"/>
    </symbol>

    <symbol id="i-sparkle" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3.5 13.7 8 18.2 9.7 13.7 11.4 12 15.9 10.3 11.4 5.8 9.7 10.3 8Z"/>
      <path d="M18 15.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8Z"/>
    </symbol>

    <symbol id="i-refresh" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19.6 11.2a7.8 7.8 0 0 0-13.4-4L4 9.4"/><path d="M4 4.6v4.8h4.8"/>
      <path d="M4.4 12.8a7.8 7.8 0 0 0 13.4 4l2.2-2.2"/><path d="M20 19.4v-4.8h-4.8"/>
    </symbol>

    <symbol id="i-download" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3.8v11"/><path d="m7.4 10.2 4.6 4.6 4.6-4.6"/>
      <path d="M4.4 17.4v1.4a1.6 1.6 0 0 0 1.6 1.6h12a1.6 1.6 0 0 0 1.6-1.6v-1.4"/>
    </symbol>

    <symbol id="i-bell" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 10a5.5 5.5 0 0 1 11 0c0 3.3.9 5 1.6 5.8.3.4 0 1-.5 1H5.4c-.5 0-.8-.6-.5-1 .7-.8 1.6-2.5 1.6-5.8Z"/>
      <path d="M10.2 19.4a2 2 0 0 0 3.6 0"/>
    </symbol>

    <symbol id="i-link" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.2 13.8a3.6 3.6 0 0 0 5.1 0l3-3a3.6 3.6 0 0 0-5.1-5.1l-1.3 1.3"/>
      <path d="M13.8 10.2a3.6 3.6 0 0 0-5.1 0l-3 3a3.6 3.6 0 0 0 5.1 5.1l1.3-1.3"/>
    </symbol>

    <symbol id="i-bolt" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13.2 2.8 5 13.4h5.6L9.8 21.2 18 10.6h-5.6Z"/>
    </symbol>

    <symbol id="i-menu" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 7.5h15M4.5 12h15M4.5 16.5h15"/>
    </symbol>
      </defs>
    </svg>
  );
}

export function Icon({
  name,
  className,
  size
}: {
  name: IconName;
  className?: string;
  size?: number | string;
}) {
  return (
    <svg
      className={['ic', className].filter(Boolean).join(' ')}
      aria-hidden="true"
      focusable="false"
      style={size ? { width: size, height: size } : undefined}
    >
      <use href={`#${name}`} />
    </svg>
  );
}
