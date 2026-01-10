

// A simple, clean "ding" sound (shortened version for brevity, usually you'd want a real mp3/wav base64)
// Since I can't generate a real high-quality mp3 base64 here without it being huge, 
// I'll assume we use a standard Web Audio API beep or a very short placeholder.
// BETTER APPROACH: Use Web Audio API for a synthetic "ding" so no assets are needed.

export const playSuccessSound = () => {
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;

        const ctx = new AudioContext();


        // We'll create a helper to play chords
        const playNote = (freq: number, start: number, dur: number) => {
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.connect(g);
            g.connect(ctx.destination);

            o.type = 'sine';
            o.frequency.value = freq;

            g.gain.setValueAtTime(0, start);
            g.gain.linearRampToValueAtTime(0.2, start + 0.05);
            g.gain.exponentialRampToValueAtTime(0.01, start + dur);

            o.start(start);
            o.stop(start + dur);
        };

        const now = ctx.currentTime;
        // Major Chord Arpeggio (C6, E6, G6, C7)
        playNote(1046.50, now, 0.6);
        playNote(1318.51, now + 0.08, 0.6);
        playNote(1567.98, now + 0.16, 0.6);
        playNote(2093.00, now + 0.24, 0.8);

    } catch (error) {
        console.error('Audio play failed', error);
    }
};
