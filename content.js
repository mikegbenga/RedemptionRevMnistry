/* ═══════════════════════════════════════════════════════════════
   RRMI — WEBSITE CONTENT (sermons, gallery, testimonies, events, giving)
   ───────────────────────────────────────────────────────────────
   This is the ONE file to edit when you have new content.
   Everything listed here is shown to every visitor.

   HOW TO ADD AN ITEM
   1. Copy the example inside the comment under the list you want.
   2. Paste it between the [ ] brackets (remove the  //  marks).
   3. Put a comma after every item except the last.
   4. Save, then upload this file to your web host.

   While a list is empty  [ ]  the website shows a tidy
   "coming soon" message in that section instead.
   Newest items go FIRST. The home page shows the first 6 sermons.
   ═══════════════════════════════════════════════════════════════ */

window.RRMI_CONTENT = {

  /* ── LATEST SERMONS ─────────────────────────────────────────
     youtube   = the code after "watch?v=" in the YouTube link
                 e.g. https://www.youtube.com/watch?v=AbC123xYz → "AbC123xYz"
     thumbnail = optional. Leave "" to use the YouTube picture
                 automatically, or put a file in assets/images/sermons/
     audio     = optional link to an MP3 file ("" for none)
     date      = YYYY-MM-DD
     Example:
       { title: "Walking In The Fullness Of God", preacher: "Pastor Itoro Isaac James",
         date: "2026-11-16", category: "Faith", youtube: "AbC123xYz",
         audio: "", thumbnail: "" },
  ─────────────────────────────────────────────────────────── */
  sermons: [

  ],

  /* ── CHURCH GALLERY ─────────────────────────────────────────
     1. Put the photo in the folder  assets/images/gallery/
        (JPG or WebP, ideally under 500 KB, landscape or square)
     2. Add a line here pointing to it.
     category must be one of: "Worship", "Events", "Community"
     (these match the filter buttons above the gallery)
     Example:
       { title: "Sunday Worship Service", category: "Worship",
         src: "assets/images/gallery/sunday-service-nov-2026.jpg" },
  ─────────────────────────────────────────────────────────── */
  gallery: [

  ],

  /* ── TESTIMONIES ────────────────────────────────────────────
     Only publish a testimony with the person's permission.
     initials = 2 letters shown in the round badge
     Example:
       { name: "Sister Jane Doe", location: "Port Harcourt",
         text: "Write the testimony here in the person's own words.",
         rating: 5, initials: "JD" },
  ─────────────────────────────────────────────────────────── */
  testimonials: [

  ],

  /* ── UPCOMING EVENTS ────────────────────────────────────────
     Past events disappear from the website automatically.
     featured: true shows a countdown on that event.
     Example:
       { title: "Annual Convention 2027", date: "2027-03-15", time: "9:00 AM",
         location: "RRMI Auditorium", category: "Convention", featured: true },
  ─────────────────────────────────────────────────────────── */
  events: [

  ],

  /* ── POP-UP ANNOUNCEMENT ────────────────────────────────────
     Shown once per visit when show is true (e.g. a flyer).
     image = a file in assets/images/   link = where the button goes
  ─────────────────────────────────────────────────────────── */
  announcement: {
    show: false,
    title: "",
    message: "",
    image: "",
    cta: "Learn more",
    link: ""
  },

  /* ── GIVING ─────────────────────────────────────────────────
     Fill these in to show the church account on the Give section
     (with a "Copy account number" button). Leave "" to show
     "Call or WhatsApp 08030949380 for our account details".
  ─────────────────────────────────────────────────────────── */
  giving: {
    bankName: "",
    accountName: "",
    accountNumber: ""
  }

};
