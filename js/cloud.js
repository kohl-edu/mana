const UTCDCloud = (() => {
  const cfg = window.UTCD_CONFIG || {};
  let client = null;
  let currentSession = null;
  let readyResolve;

  const ready = new Promise(resolve => {
    readyResolve = resolve;
  });

  function configured() {
    return Boolean(
      cfg.supabaseUrl &&
      cfg.supabasePublishableKey &&
      !cfg.supabaseUrl.includes("YOUR_") &&
      !cfg.supabasePublishableKey.includes("YOUR_")
    );
  }

  function rawGetDB() {
    try {
      return JSON.parse(localStorage.getItem("utcd_db_v1") || "{}");
    } catch {
      return {};
    }
  }

  function rawSetDB(db) {
    localStorage.setItem("utcd_db_v1", JSON.stringify(db));
  }

  function withIds(db) {
    const out = {
      user: db.user || null,
      savedVerses: Array.isArray(db.savedVerses) ? db.savedVerses : [],
      notes: Array.isArray(db.notes) ? db.notes : [],
      reflections: Array.isArray(db.reflections) ? db.reflections : [],
      activities: Array.isArray(db.activities) ? db.activities : []
    };

    out.notes = out.notes.map(x => ({
      ...x,
      id: x.id || crypto.randomUUID()
    }));

    out.reflections = out.reflections.map(x => ({
      ...x,
      id: x.id || crypto.randomUUID()
    }));

    out.activities = out.activities.map(x => ({
      ...x,
      id: x.id || crypto.randomUUID()
    }));

    out.savedVerses = out.savedVerses.map(x => ({
      ...x,
      id: x.id || "verse:" + String(x.ref || x.text || crypto.randomUUID())
    }));

    return out;
  }

  function emptyDB() {
    return {
      user: null,
      savedVerses: [],
      notes: [],
      reflections: [],
      activities: []
    };
  }

  function keyFor(type, item) {
    return type + ":" + String(item.id);
  }

  function mergeArrays(local, remote, type) {
    const map = new Map();

    [...remote, ...local].forEach(item => {
      map.set(keyFor(type, item), item);
    });

    return [...map.values()];
  }

  async function loadRemoteAndMerge(user) {
    const rawLocal = withIds(rawGetDB());
    const sameLocalUser = Boolean(rawLocal.user?.email && user.email && rawLocal.user.email.toLowerCase() === user.email.toLowerCase());
    const local = sameLocalUser ? rawLocal : { ...emptyDB(), user: rawLocal.user };

    const { data: profile, error: profileError } = await client
      .from("profiles")
      .select("name")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) throw profileError;

    const { data: rows, error: rowsError } = await client
      .from("user_records")
      .select("id,type,local_id,data,created_at,updated_at")
      .eq("user_id", user.id);

    if (rowsError) throw rowsError;

    const remote = emptyDB();

    (rows || []).forEach(row => {
      const item = {
        ...(row.data || {}),
        id: row.local_id || row.id,
        date: row.data?.date || row.created_at
      };

      if (row.type === "verse") remote.savedVerses.push(item);
      if (row.type === "note") remote.notes.push(item);
      if (row.type === "reflection") remote.reflections.push(item);
      if (row.type === "activity") remote.activities.push(item);
    });

    const merged = {
      user: {
        id: user.id,
        name: profile?.name || user.user_metadata?.name || local.user?.name || "Usuário",
        email: user.email || local.user?.email || ""
      },
      savedVerses: mergeArrays(local.savedVerses, remote.savedVerses, "verse"),
      notes: mergeArrays(local.notes, remote.notes, "note"),
      reflections: mergeArrays(local.reflections, remote.reflections, "reflection"),
      activities: mergeArrays(local.activities, remote.activities, "activity")
    };

    rawSetDB(merged);
    await syncDB(merged, user);
    return merged;
  }

  async function syncDB(db, user = null) {
    if (!client || !(user || currentSession?.user)) return;

    const authUser = user || currentSession.user;
    const normalized = withIds(db);

    const profile = {
      id: authUser.id,
      name: normalized.user?.name || authUser.user_metadata?.name || "Usuário",
      updated_at: new Date().toISOString()
    };

    const { error: profileError } = await client
      .from("profiles")
      .upsert(profile, { onConflict: "id" });

    if (profileError) throw profileError;

    const rows = [];

    normalized.savedVerses.forEach(item => rows.push({
      user_id: authUser.id,
      type: "verse",
      local_id: String(item.id),
      data: item,
      updated_at: new Date().toISOString()
    }));

    normalized.notes.forEach(item => rows.push({
      user_id: authUser.id,
      type: "note",
      local_id: String(item.id),
      data: item,
      updated_at: new Date().toISOString()
    }));

    normalized.reflections.forEach(item => rows.push({
      user_id: authUser.id,
      type: "reflection",
      local_id: String(item.id),
      data: item,
      updated_at: new Date().toISOString()
    }));

    normalized.activities.forEach(item => rows.push({
      user_id: authUser.id,
      type: "activity",
      local_id: String(item.id),
      data: item,
      updated_at: new Date().toISOString()
    }));

    if (!rows.length) return;

    const { error } = await client
      .from("user_records")
      .upsert(rows, { onConflict: "user_id,type,local_id" });

    if (error) throw error;
  }

  async function init() {
    if (!configured() || !window.supabase?.createClient) {
      readyResolve({ configured: false, session: null });
      return;
    }

    client = window.supabase.createClient(
      cfg.supabaseUrl,
      cfg.supabasePublishableKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      }
    );

    const { data, error } = await client.auth.getSession();

    if (error) {
      console.error("Supabase session error:", error);
    }

    currentSession = data?.session || null;

    if (currentSession?.user) {
      try {
        await loadRemoteAndMerge(currentSession.user);
      } catch (err) {
        console.error("Não foi possível sincronizar os dados:", err);
      }
    }

    client.auth.onAuthStateChange((event, session) => {
      currentSession = session;

      if (event === "SIGNED_OUT") {
        const local = rawGetDB();
        rawSetDB({
          ...emptyDB(),
          user: null,
          savedVerses: local.savedVerses,
          notes: local.notes,
          reflections: local.reflections,
          activities: local.activities
        });
      }
    });

    readyResolve({ configured: true, session: currentSession });
  }

  async function signIn(email, password) {
    if (!configured()) throw new Error("Supabase ainda não foi configurado.");
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;

    currentSession = data.session;
    await loadRemoteAndMerge(data.user);
    return data.user;
  }

  async function signUp(name, email, password) {
    if (!configured()) throw new Error("Supabase ainda não foi configurado.");

    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: window.location.origin + "/progresso.html"
      }
    });

    if (error) throw error;

    if (data.user && data.session) {
      currentSession = data.session;
      const local = withIds(rawGetDB());
      local.user = { id: data.user.id, name, email };
      rawSetDB(local);
      await syncDB(local, data.user);
    }

    return data;
  }

  async function signOut() {
    if (client) {
      const { error } = await client.auth.signOut();
      if (error) throw error;
    }
    currentSession = null;
  }

  async function persist(db) {
    if (!configured() || !currentSession?.user) return;
    try {
      await syncDB(db, currentSession.user);
    } catch (err) {
      console.error("Falha ao sincronizar:", err);
      window.dispatchEvent(new CustomEvent("utcd:sync-error", { detail: err }));
    }
  }

  function isConfigured() {
    return configured();
  }

  function isSignedIn() {
    return Boolean(currentSession?.user);
  }

  function getUser() {
    return currentSession?.user || null;
  }

  return {
    ready,
    init,
    signIn,
    signUp,
    signOut,
    persist,
    isConfigured,
    isSignedIn,
    getUser
  };
})();

window.UTCDCloud = UTCDCloud;
window.UTCDReady = UTCDCloud.ready;
UTCDCloud.init();
