import { Diagram } from './DiagramKit.jsx';
import { stack, down, withGeometry } from './layout.js';

const W = 420;

function build() {
  // Boot (top-left): each box is shown as one step of the boot sequence.
  const boot = stack(
    [
      { id: 'stick', lines: ['USB boot stick'], color: 'orange' },
      { id: 'image', lines: ['bootimage'], color: 'orange' },
      { id: 'init', lines: ['kernel init', 'interrupts, paging,', 'memory'], color: 'orange' },
    ],
    { x: 18, y: 32, w: 184 },
  );

  // Control inputs (top-right).
  const control = stack(
    [
      { id: 'kbd', lines: ['PS/2 or USB', 'keyboard'], color: 'cyan' },
      { id: 'serial', lines: ['serial console'], color: 'cyan' },
    ],
    { x: 242, y: 32, w: 140 },
  );

  const mainLoop = withGeometry({
    id: 'loop',
    lines: ['main loop', 'input, audio, network, screen'],
    color: 'orange',
    x: 8,
    y: 214,
    w: 404,
    h: 44,
  });

  // Storage + audio path (left column).
  const storage = stack(
    [
      { id: 'music', lines: ['music USB stick'], color: 'cyan' },
      { id: 'hc', lines: ['EHCI / UHCI host ctrl'], color: 'cyan' },
      { id: 'msc', lines: ['mass storage (BOT/SCSI)'], color: 'cyan' },
      { id: 'fat', lines: ['FAT32 / FAT16', 'streaming file reader'], color: 'cyan' },
    ],
    { x: 18, y: 306, w: 184 },
  );
  const audioTop = storage[storage.length - 1].b + 10 + 14 + 24;
  const audio = stack(
    [
      { id: 'dec', lines: ['decoders: WAV/FLAC/MP3'], color: 'orange' },
      { id: 'player', lines: ['player'], color: 'orange' },
      { id: 'hda', lines: ['Intel HDA driver (DMA)'], color: 'orange' },
      { id: 'codec', lines: ['codec'], color: 'orange' },
      { id: 'out', lines: ['analog or digital out', 'line-out / S/PDIF / HDMI'], color: 'orange' },
    ],
    { x: 18, y: audioTop, w: 184 },
  );

  // Network (right column), drawn so data flows up toward the main loop.
  const net = stack(
    [
      { id: 'mpd', lines: ['MPD server', 'TCP 6600'], color: 'fuchsia' },
      { id: 'smol', lines: ['smoltcp (DHCP)'], color: 'fuchsia' },
      { id: 'nic', lines: ['NIC', 'e1000 / RTL8168'], color: 'fuchsia' },
      { id: 'clients', lines: ['MPD clients', 'mpc, ncmpcpp, ...'], color: 'fuchsia' },
    ],
    { x: 242, y: 306, w: 160 },
  );

  const lastAudio = audio[audio.length - 1];
  const ui = withGeometry({
    id: 'ui',
    lines: ['80x25 text-mode UI'],
    color: 'orange',
    x: 8,
    y: lastAudio.b + 10 + 24,
    w: 404,
    h: 32,
  });

  const nodes = [...boot, ...control, mainLoop, ...storage, ...audio, ...net, ui];
  const N = Object.fromEntries(nodes.map((n) => [n.id, n]));

  const chain = (list, color, extra) =>
    list.slice(0, -1).map((n, i) => down(n, list[i + 1], { color, ...extra }));

  const edges = [
    ...chain(boot, 'orange'),
    down(N.init, N.loop, { color: 'orange' }),
    // keyboard + serial share a bus into the main loop
    {
      pts: [
        [N.kbd.r, N.kbd.cy],
        [396, N.kbd.cy],
        [396, N.loop.t],
      ],
      color: 'cyan',
    },
    {
      pts: [
        [N.serial.r, N.serial.cy],
        [396, N.serial.cy],
      ],
      color: 'cyan',
      noHead: true,
    },
    // storage -> audio path
    ...chain([...storage, ...audio], 'cyan').map((e, i) =>
      i >= storage.length - 1 ? { ...e, color: 'orange' } : e,
    ),
    // network chain, bidirectional, up to the main loop
    {
      pts: [
        [N.mpd.cx, N.mpd.t],
        [N.mpd.cx, N.loop.b],
      ],
      color: 'fuchsia',
      both: true,
    },
    {
      pts: [
        [N.smol.cx, N.smol.t],
        [N.smol.cx, N.mpd.b],
      ],
      color: 'fuchsia',
      both: true,
    },
    {
      pts: [
        [N.nic.cx, N.nic.t],
        [N.nic.cx, N.smol.b],
      ],
      color: 'fuchsia',
      both: true,
    },
    {
      pts: [
        [N.clients.cx, N.clients.t],
        [N.clients.cx, N.nic.b],
      ],
      color: 'fuchsia',
      both: true,
    },
    // main loop drives the player and the screen through the channel between columns
    {
      pts: [
        [222, N.loop.b],
        [222, N.ui.t],
      ],
      color: 'orange',
    },
    {
      pts: [
        [222, N.player.cy],
        [N.player.r, N.player.cy],
      ],
      color: 'orange',
    },
  ];

  const groups = [
    { label: 'BOOT', color: 'orange', ids: ['stick', 'image', 'init'], padX: 10 },
    {
      label: 'CONTROL INPUT',
      color: 'cyan',
      ids: ['kbd', 'serial'],
      rect: { x: 232, y: 8, w: 180, h: 120 },
    },
    { label: 'STORAGE', color: 'cyan', ids: storage.map((n) => n.id) },
    { label: 'AUDIO', color: 'orange', ids: audio.map((n) => n.id) },
    { label: 'NETWORK', color: 'fuchsia', ids: net.map((n) => n.id) },
  ];
  // BOOT group needs its own top margin above the first box
  groups[0].rect = {
    x: 8,
    y: 8,
    w: 204,
    h: N.init.b + 10 - 8,
  };

  return { nodes, edges, groups, height: ui.b + 10 };
}

const DESC =
  'Melody OS architecture. At boot, a USB boot stick loads the bootimage, which starts kernel initialisation (interrupts, paging and memory) and then the main loop. ' +
  'The main loop handles input, audio, network and screen. Audio data path: a music USB stick is read through the EHCI or UHCI host controller and mass-storage layer (BOT/SCSI), ' +
  'then the FAT32/FAT16 filesystem streams files to the WAV, FLAC and MP3 decoders, the player, and the Intel HD Audio driver using DMA, through the codec to analog or digital (S/PDIF, HDMI) output. ' +
  'Control inputs are a PS/2 or USB keyboard, a serial console, and the network path: a NIC (e1000 or RTL8168), the smoltcp stack with DHCP, and an MPD server on TCP port 6600 used by MPD clients. ' +
  'The main loop drives the player and an 80 by 25 text-mode user interface.';

export default function MelodyOsDiagram() {
  const { nodes, edges, groups, height } = build();
  return (
    <Diagram
      title="Melody OS architecture and data flow"
      desc={DESC}
      width={W}
      height={height}
      nodes={nodes}
      edges={edges}
      groups={groups}
    />
  );
}
