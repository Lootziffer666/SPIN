
"""
SPIN UI Prototype (Stage 12 UI Mock)
- Notion/Figma-like whitespace, card/chunk objects
- "Invisible UI": edge drawers appear when mouse touches window edges
- Diagnostic color coding: thin bars only (green/yellow/red) – no colored panels
- Dark "Deep Work" mode: soft grays, reduced contrast
- Focus mode: de-emphasize non-active cards
- Export: copies a structured snapshot to clipboard (and can open mailto)

No external dependencies. Python 3.10+ recommended.
Run: python spin_ui_stage12_prototype.py
"""

import tkinter as tk
from tkinter import ttk, messagebox, filedialog
import json
import time
import webbrowser
from dataclasses import dataclass, asdict
from typing import List, Optional

COPYRIGHT_LINE = "© 2026 Christian Amine"
MAILTO = "lootziffer666@outlook.de"


# -----------------------------
# Data model
# -----------------------------

@dataclass
class Chunk:
    title: str
    text: str
    state: str  # "stable" | "warn" | "blocked"
    meta: dict


def demo_chunks() -> List[Chunk]:
    return [
        Chunk(
            title="Abschnitt 1",
            text="ich schreibe erstmal los",
            state="stable",
            meta={"flow": "starting", "notes": []},
        ),
        Chunk(
            title="Abschnitt 2",
            text="dann wird der satz länger und länger und ich verliere ein wenig die übersicht",
            state="warn",
            meta={"flow": "stumbling", "notes": ["Mögliche als/wie-Stelle"]},
        ),
        Chunk(
            title="Abschnitt 3",
            text="… und dann stockt es plötzlich",
            state="blocked",
            meta={"flow": "blocked", "notes": ["Mehrdeutige wider/wieder-Stelle"]},
        ),
    ]


# -----------------------------
# Style system
# -----------------------------

class Theme:
    def __init__(self, mode: str):
        self.mode = mode  # "light" or "dark"
        self.apply_defaults()

    def apply_defaults(self):
        # Neutral surfaces
        if self.mode == "dark":
            self.bg = "#121418"              # deep editor charcoal
            self.canvas_bg = "#121418"
            self.panel_bg = "#171A20"
            self.card_bg = "#181C22"
            self.card_bg_active = "#1D2230"
            self.card_border = "#2A3140"
            self.text = "#D7DAE0"
            self.text_muted = "#9AA3B2"
            self.divider = "#242A36"
            self.shadow = "#0E1014"
        else:
            self.bg = "#FAFAFB"
            self.canvas_bg = "#FAFAFB"
            self.panel_bg = "#FFFFFF"
            self.card_bg = "#FFFFFF"
            self.card_bg_active = "#F3F5FA"
            self.card_border = "#E5E7EF"
            self.text = "#15171C"
            self.text_muted = "#5B6575"
            self.divider = "#E9EBF2"
            self.shadow = "#F2F3F7"

        # Diagnostic bars only (thin)
        self.diag_green = "#22C55E"
        self.diag_yellow = "#EAB308"
        self.diag_red = "#EF4444"

        # Subtle accent for interactive affordances (not diagnostic)
        self.accent = "#60A5FA" if self.mode == "dark" else "#2563EB"


def diag_color(theme: Theme, state: str) -> str:
    if state == "stable":
        return theme.diag_green
    if state == "warn":
        return theme.diag_yellow
    return theme.diag_red


# -----------------------------
# Utilities
# -----------------------------

def open_mailto(subject: str, body: str):
    # Keep it short to avoid mailto limits; user can export JSON to file if needed
    url = f"mailto:{MAILTO}?subject={_urlencode(subject)}&body={_urlencode(body)}"
    webbrowser.open(url)

def _urlencode(s: str) -> str:
    from urllib.parse import quote
    return quote(s, safe="")

def safe_clipboard_set(root: tk.Tk, text: str):
    root.clipboard_clear()
    root.clipboard_append(text)
    root.update_idletasks()


# -----------------------------
# Edge drawers ("Invisible UI")
# -----------------------------

class EdgeDrawer(tk.Frame):
    """
    Drawer that slides in/out from one edge.
    edge: "top" | "bottom" | "left" | "right"
    """
    def __init__(self, master, theme: Theme, edge: str, size: int, **kwargs):
        super().__init__(master, bg=theme.panel_bg, highlightthickness=1, highlightbackground=theme.divider, **kwargs)
        self.master = master
        self.theme = theme
        self.edge = edge
        self.size = size
        self.visible = False
        self.animating = False
        self._place_hidden()

    def _place_hidden(self):
        w = self.master.winfo_width()
        h = self.master.winfo_height()
        if w <= 1 or h <= 1:
            # window not realized yet, schedule
            self.after(50, self._place_hidden)
            return

        if self.edge == "top":
            self.place(x=0, y=-self.size, width=w, height=self.size)
        elif self.edge == "bottom":
            self.place(x=0, y=h, width=w, height=self.size)
        elif self.edge == "left":
            self.place(x=-self.size, y=0, width=self.size, height=h)
        elif self.edge == "right":
            self.place(x=w, y=0, width=self.size, height=h)

    def relayout(self):
        if not self.visible and not self.animating:
            self._place_hidden()
        else:
            self._place_shown()

    def _place_shown(self):
        w = self.master.winfo_width()
        h = self.master.winfo_height()
        if self.edge == "top":
            self.place(x=0, y=0, width=w, height=self.size)
        elif self.edge == "bottom":
            self.place(x=0, y=h-self.size, width=w, height=self.size)
        elif self.edge == "left":
            self.place(x=0, y=0, width=self.size, height=h)
        elif self.edge == "right":
            self.place(x=w-self.size, y=0, width=self.size, height=h)

    def show(self):
        if self.visible or self.animating:
            return
        self.visible = True
        self._animate(show=True)

    def hide(self):
        if (not self.visible) or self.animating:
            return
        self.visible = False
        self._animate(show=False)

    def _animate(self, show: bool):
        self.animating = True
        w = self.master.winfo_width()
        h = self.master.winfo_height()

        steps = 10
        duration_ms = 140  # subtle, not flashy
        dt = max(10, duration_ms // steps)

        def lerp(a, b, t):
            return a + (b - a) * t

        if self.edge == "top":
            y0, y1 = (-self.size, 0) if show else (0, -self.size)
            def place_at(t):
                y = int(lerp(y0, y1, t))
                self.place(x=0, y=y, width=w, height=self.size)
        elif self.edge == "bottom":
            y0, y1 = (h, h-self.size) if show else (h-self.size, h)
            def place_at(t):
                y = int(lerp(y0, y1, t))
                self.place(x=0, y=y, width=w, height=self.size)
        elif self.edge == "left":
            x0, x1 = (-self.size, 0) if show else (0, -self.size)
            def place_at(t):
                x = int(lerp(x0, x1, t))
                self.place(x=x, y=0, width=self.size, height=h)
        else:  # right
            x0, x1 = (w, w-self.size) if show else (w-self.size, w)
            def place_at(t):
                x = int(lerp(x0, x1, t))
                self.place(x=x, y=0, width=self.size, height=h)

        i = 0
        def step():
            nonlocal i
            i += 1
            t = min(1.0, i / steps)
            place_at(t)
            if t < 1.0:
                self.after(dt, step)
            else:
                self.animating = False

        step()


# -----------------------------
# Chunk card UI
# -----------------------------

class ChunkCard(tk.Frame):
    def __init__(self, master, theme: Theme, chunk: Chunk, on_focus, on_drag_start, on_drag_move, on_drag_end):
        super().__init__(master, bg=theme.card_bg, highlightthickness=1, highlightbackground=theme.card_border)
        self.theme = theme
        self.chunk = chunk
        self.on_focus = on_focus
        self.on_drag_start = on_drag_start
        self.on_drag_move = on_drag_move
        self.on_drag_end = on_drag_end
        self._active = False

        # Header row: grab handle + title + state dot (muted)
        header = tk.Frame(self, bg=theme.card_bg)
        header.pack(fill="x", padx=14, pady=(12, 6))

        self.grab = tk.Label(header, text="⋮⋮", fg=theme.text_muted, bg=theme.card_bg, font=("Segoe UI", 11))
        self.grab.pack(side="left")
        self.grab.bind("<ButtonPress-1>", self._drag_start)
        self.grab.bind("<B1-Motion>", self._drag_move)
        self.grab.bind("<ButtonRelease-1>", self._drag_end)

        self.title = tk.Label(header, text=chunk.title, fg=theme.text, bg=theme.card_bg, font=("Segoe UI", 11, "bold"))
        self.title.pack(side="left", padx=(10, 0))

        # Body
        self.body = tk.Label(
            self, text=chunk.text, fg=theme.text, bg=theme.card_bg,
            font=("Segoe UI", 11), justify="left", wraplength=680
        )
        self.body.pack(fill="x", padx=14, pady=(0, 8))

        # Diagnostic thin bar
        bar = tk.Frame(self, bg=diag_color(theme, chunk.state), height=3)
        bar.pack(fill="x", side="bottom")

        # Click to focus
        self.bind("<Button-1>", self._focus)
        for w in (header, self.title, self.body):
            w.bind("<Button-1>", self._focus)

    def set_active(self, active: bool):
        self._active = active
        bg = self.theme.card_bg_active if active else self.theme.card_bg
        self.configure(bg=bg, highlightbackground=self.theme.card_border)
        for child in self.winfo_children():
            if isinstance(child, tk.Frame) or isinstance(child, tk.Label):
                try:
                    child.configure(bg=bg)
                except tk.TclError:
                    pass
        # update labels fg for focus mode elsewhere if needed

    def set_dimmed(self, dim: bool):
        fg = self.theme.text_muted if dim else self.theme.text
        self.body.configure(fg=fg)
        self.title.configure(fg=fg if dim else self.theme.text)

    def _focus(self, _evt=None):
        self.on_focus(self)

    def _drag_start(self, evt):
        self.on_drag_start(self, evt)

    def _drag_move(self, evt):
        self.on_drag_move(self, evt)

    def _drag_end(self, evt):
        self.on_drag_end(self, evt)


# -----------------------------
# Main App
# -----------------------------

class SpinUIApp:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("SPIN – UI Prototype")
        self.root.geometry("980x720")
        self.root.minsize(860, 620)

        self.theme = Theme(mode="dark")
        self.focus_mode = tk.BooleanVar(value=True)

        self.chunks: List[Chunk] = demo_chunks()
        self.cards: List[ChunkCard] = []
        self.active_card: Optional[ChunkCard] = None

        self._dragging_card: Optional[ChunkCard] = None
        self._drag_start_y = 0

        self._build_ui()
        self._bind_invisible_ui()
        self._apply_theme()

        # Initial focus
        self.root.after(150, lambda: self._set_active_card(self.cards[0] if self.cards else None))

    # ---------- UI build ----------

    def _build_ui(self):
        self.root.configure(bg=self.theme.bg)

        # Main canvas area (whitespace)
        self.main = tk.Frame(self.root, bg=self.theme.canvas_bg)
        self.main.pack(fill="both", expand=True)

        # Top "quiet title" area (very minimal)
        self.topline = tk.Frame(self.main, bg=self.theme.canvas_bg)
        self.topline.pack(fill="x", padx=22, pady=(18, 6))

        self.title = tk.Label(self.topline, text="Arbeitsfläche", fg=self.theme.text_muted, bg=self.theme.canvas_bg,
                              font=("Segoe UI", 10))
        self.title.pack(side="left")

        self.mode_btn = tk.Button(
            self.topline, text="Deep Work", relief="flat", bd=0,
            command=self._toggle_theme, font=("Segoe UI", 10)
        )
        self.mode_btn.pack(side="right")

        # Scrollable area with cards
        self.scroller = tk.Canvas(self.main, bg=self.theme.canvas_bg, highlightthickness=0)
        self.scroller.pack(fill="both", expand=True, padx=22, pady=(8, 22))

        self.scrollbar = ttk.Scrollbar(self.main, orient="vertical", command=self.scroller.yview)
        self.scrollbar.place(relx=1.0, rely=0.0, relheight=1.0, anchor="ne")
        self.scroller.configure(yscrollcommand=self.scrollbar.set)

        self.list_frame = tk.Frame(self.scroller, bg=self.theme.canvas_bg)
        self.window_id = self.scroller.create_window((0, 0), window=self.list_frame, anchor="nw")

        self.list_frame.bind("<Configure>", self._on_list_configure)
        self.scroller.bind("<Configure>", self._on_canvas_configure)
        self.scroller.bind_all("<MouseWheel>", self._on_mousewheel)

        # Populate cards
        self._render_cards()

        # Edge drawers
        self.drawer_top = EdgeDrawer(self.root, self.theme, edge="top", size=64)
        self.drawer_bottom = EdgeDrawer(self.root, self.theme, edge="bottom", size=84)
        self.drawer_left = EdgeDrawer(self.root, self.theme, edge="left", size=240)
        self.drawer_right = EdgeDrawer(self.root, self.theme, edge="right", size=260)

        self._build_drawer_contents()

        self.root.bind("<Configure>", lambda _e: self._relayout_drawers())

    def _build_drawer_contents(self):
        # Top: Settings / Export
        for w in self.drawer_top.winfo_children():
            w.destroy()
        row = tk.Frame(self.drawer_top, bg=self.theme.panel_bg)
        row.pack(fill="both", expand=True, padx=16, pady=12)

        btn_settings = tk.Button(row, text="Einstellungen", command=self._open_settings, relief="flat", bd=0)
        btn_export = tk.Button(row, text="Export", command=self._export_snapshot, relief="flat", bd=0)
        btn_about = tk.Button(row, text="About", command=self._about, relief="flat", bd=0)

        for b in (btn_settings, btn_export, btn_about):
            b.configure(bg=self.theme.panel_bg, fg=self.theme.text, activebackground=self.theme.card_bg_active,
                        activeforeground=self.theme.text, font=("Segoe UI", 10))
            b.pack(side="left", padx=(0, 12))

        # Bottom: "Worldbible / Database" placeholder
        for w in self.drawer_bottom.winfo_children():
            w.destroy()
        box = tk.Frame(self.drawer_bottom, bg=self.theme.panel_bg)
        box.pack(fill="both", expand=True, padx=16, pady=14)
        tk.Label(box, text="Datenbank / Worldbible (Platzhalter)", fg=self.theme.text_muted, bg=self.theme.panel_bg,
                 font=("Segoe UI", 10)).pack(side="left")

        # Left: Details
        for w in self.drawer_left.winfo_children():
            w.destroy()
        left = tk.Frame(self.drawer_left, bg=self.theme.panel_bg)
        left.pack(fill="both", expand=True, padx=14, pady=12)
        tk.Label(left, text="Details", fg=self.theme.text, bg=self.theme.panel_bg,
                 font=("Segoe UI", 11, "bold")).pack(anchor="w")
        self.details_text = tk.Label(left, text="", fg=self.theme.text_muted, bg=self.theme.panel_bg,
                                     font=("Segoe UI", 10), justify="left", wraplength=210)
        self.details_text.pack(anchor="w", pady=(8, 0))

        # Right: Characters / Entities placeholder
        for w in self.drawer_right.winfo_children():
            w.destroy()
        right = tk.Frame(self.drawer_right, bg=self.theme.panel_bg)
        right.pack(fill="both", expand=True, padx=14, pady=12)
        tk.Label(right, text="Charaktere / Entities", fg=self.theme.text, bg=self.theme.panel_bg,
                 font=("Segoe UI", 11, "bold")).pack(anchor="w")
        tk.Label(right, text="(Platzhalter)", fg=self.theme.text_muted, bg=self.theme.panel_bg,
                 font=("Segoe UI", 10)).pack(anchor="w", pady=(8, 0))

    # ---------- Rendering ----------

    def _render_cards(self):
        for c in self.cards:
            c.destroy()
        self.cards.clear()

        # whitespace spacing like Notion
        for idx, ch in enumerate(self.chunks):
            card = ChunkCard(
                self.list_frame, self.theme, ch,
                on_focus=self._set_active_card,
                on_drag_start=self._drag_start,
                on_drag_move=self._drag_move,
                on_drag_end=self._drag_end
            )
            card.pack(fill="x", pady=(0, 14))
            self.cards.append(card)

    # ---------- Events & behavior ----------

    def _on_list_configure(self, _evt):
        self.scroller.configure(scrollregion=self.scroller.bbox("all"))

    def _on_canvas_configure(self, evt):
        # keep list frame width synced
        self.scroller.itemconfigure(self.window_id, width=evt.width)

    def _on_mousewheel(self, evt):
        # Windows: evt.delta is multiple of 120
        self.scroller.yview_scroll(int(-1*(evt.delta/120)), "units")

    def _set_active_card(self, card: Optional[ChunkCard]):
        self.active_card = card
        for c in self.cards:
            c.set_active(c is card)
        if self.focus_mode.get():
            for c in self.cards:
                c.set_dimmed(c is not card)
        else:
            for c in self.cards:
                c.set_dimmed(False)

        # Update details drawer
        if card:
            meta = card.chunk.meta
            notes = meta.get("notes", [])
            flow = meta.get("flow", "")
            txt = f"Zustand: {card.chunk.state}\nSchreibfluss: {flow}\n\nHinweise:\n" + ("\n".join(f"• {n}" for n in notes) if notes else "• Keine")
            self.details_text.configure(text=txt)
        else:
            self.details_text.configure(text="")

    # Drag & drop reorder (simple swap based on pointer position)
    def _drag_start(self, card: ChunkCard, evt):
        self._dragging_card = card
        self._drag_start_y = evt.y_root
        self._set_active_card(card)

    def _drag_move(self, card: ChunkCard, evt):
        if self._dragging_card is None:
            return
        dy = evt.y_root - self._drag_start_y
        # If moved enough, swap with neighbor
        threshold = 24
        idx = self.cards.index(card)
        if dy > threshold and idx < len(self.cards) - 1:
            self._swap(idx, idx+1)
            self._drag_start_y = evt.y_root
        elif dy < -threshold and idx > 0:
            self._swap(idx, idx-1)
            self._drag_start_y = evt.y_root

    def _drag_end(self, card: ChunkCard, _evt):
        self._dragging_card = None

    def _swap(self, i: int, j: int):
        # swap in data list then re-render
        self.chunks[i], self.chunks[j] = self.chunks[j], self.chunks[i]
        self._render_cards()
        # restore focus to the moved card (by title match best-effort)
        target_title = self.chunks[j].title
        for c in self.cards:
            if c.chunk.title == target_title:
                self._set_active_card(c)
                break

    # ---------- Invisible UI (edge drawers) ----------

    def _bind_invisible_ui(self):
        self.root.bind("<Motion>", self._on_motion)
        self.root.bind("<Leave>", lambda _e: self._hide_all_drawers())

    def _on_motion(self, evt):
        x, y = evt.x, evt.y
        w = self.root.winfo_width()
        h = self.root.winfo_height()
        margin = 6

        # Show/hide drawers based on proximity to edge
        if y <= margin:
            self.drawer_top.show()
        else:
            self.drawer_top.hide()

        if y >= h - margin:
            self.drawer_bottom.show()
        else:
            self.drawer_bottom.hide()

        if x <= margin:
            self.drawer_left.show()
        else:
            self.drawer_left.hide()

        if x >= w - margin:
            self.drawer_right.show()
        else:
            self.drawer_right.hide()

    def _hide_all_drawers(self):
        for d in (self.drawer_top, self.drawer_bottom, self.drawer_left, self.drawer_right):
            d.hide()

    def _relayout_drawers(self):
        for d in (self.drawer_top, self.drawer_bottom, self.drawer_left, self.drawer_right):
            d.relayout()

    # ---------- Actions ----------

    def _toggle_theme(self):
        self.theme = Theme(mode="light" if self.theme.mode == "dark" else "dark")
        self._apply_theme()
        self._render_cards()
        self._build_drawer_contents()
        self._set_active_card(self.cards[0] if self.cards else None)

    def _open_settings(self):
        win = tk.Toplevel(self.root)
        win.title("Einstellungen")
        win.configure(bg=self.theme.panel_bg)
        win.resizable(False, False)

        frm = tk.Frame(win, bg=self.theme.panel_bg)
        frm.pack(fill="both", expand=True, padx=16, pady=16)

        ttk_style = ttk.Style()
        ttk_style.configure("TCheckbutton", background=self.theme.panel_bg, foreground=self.theme.text)

        cb = ttk.Checkbutton(frm, text="Fokus-Modus (Nicht-aktive Chunks abdunkeln)", variable=self.focus_mode,
                             command=lambda: self._set_active_card(self.active_card))
        cb.pack(anchor="w")

        tk.Label(frm, text="Hinweis: Farben erscheinen nur als dünne Diagnosebalken.", fg=self.theme.text_muted,
                 bg=self.theme.panel_bg, font=("Segoe UI", 10)).pack(anchor="w", pady=(10, 0))

        tk.Button(frm, text="Schließen", command=win.destroy, relief="flat", bd=0,
                  bg=self.theme.card_bg_active, fg=self.theme.text).pack(anchor="e", pady=(14, 0))

    def _export_snapshot(self):
        snapshot = {
            "app": "SPIN_UI_PROTOTYPE",
            "timestamp": int(time.time()),
            "chunks": [asdict(c) for c in self.chunks],
        }
        txt = json.dumps(snapshot, ensure_ascii=False, indent=2)
        safe_clipboard_set(self.root, txt)
        if messagebox.askyesno("Export", "Snapshot wurde in die Zwischenablage kopiert.\n\nPer Mail öffnen?"):
            open_mailto("SPIN – Export", txt[:1800] + "\n\n(gekürzt)")

    def _about(self):
        messagebox.showinfo("About", f"SPIN – UI Prototype\n\n{COPYRIGHT_LINE}")

    # ---------- Theme application ----------

    def _apply_theme(self):
        t = self.theme
        self.root.configure(bg=t.bg)
        self.main.configure(bg=t.canvas_bg)
        self.topline.configure(bg=t.canvas_bg)
        self.title.configure(bg=t.canvas_bg, fg=t.text_muted)

        # button
        self.mode_btn.configure(
            bg=t.canvas_bg, fg=t.text_muted,
            activebackground=t.canvas_bg, activeforeground=t.text,
            highlightthickness=0
        )

        # scroller
        self.scroller.configure(bg=t.canvas_bg)

        # ttk scrollbar styling
        style = ttk.Style()
        try:
            style.theme_use("clam")
        except tk.TclError:
            pass
        style.configure("Vertical.TScrollbar", gripcount=0,
                        background=t.divider, darkcolor=t.divider, lightcolor=t.divider,
                        troughcolor=t.canvas_bg, bordercolor=t.canvas_bg, arrowcolor=t.text_muted)

        # drawers
        for d in (self.drawer_top, self.drawer_bottom, self.drawer_left, self.drawer_right):
            d.configure(bg=t.panel_bg, highlightbackground=t.divider)
            d.theme = t
        self._build_drawer_contents()

    def run(self):
        self.root.mainloop()


if __name__ == "__main__":
    SpinUIApp().run()
