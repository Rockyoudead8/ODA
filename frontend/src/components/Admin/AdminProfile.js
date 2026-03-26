import { motion, AnimatePresence } from "framer-motion";
import { Edit3, Save, X, CheckCircle, Loader2, Camera } from "lucide-react";
import { Avatar } from "./AdminShared";

export default function AdminProfile({
  userData, isEditing, setIsEditing, editForm, setEditForm,
  profileSaving, profileMsg, setProfileMsg,
  handleSaveProfile, fileInputRef, photoUploading, handlePhotoUpload,
}) {
  return (
    <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
      <div className="max-w-2xl">

        {/* Photo section */}
        <div className="bg-zinc-800/60 border border-zinc-700/60 rounded-2xl overflow-hidden mb-4">
          <div className="h-20 bg-gradient-to-r from-violet-900 to-pink-900/60" />
          <div className="px-4 sm:px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-5 -mt-8 sm:-mt-10 mb-5">
              <div className="relative self-start">
                <Avatar user={userData} size="xl" className="border-4 border-zinc-800 shadow-2xl" />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-violet-600 hover:bg-violet-500 flex items-center justify-center transition-colors shadow-lg border-2 border-zinc-800"
                  title="Change photo"
                >
                  {photoUploading ? <Loader2 size={12} className="animate-spin text-white" /> : <Camera size={12} className="text-white" />}
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </div>
              <div className="pb-1 min-w-0">
                <h2 className="text-lg sm:text-xl font-bold text-zinc-100 break-words">{userData.name}</h2>
                <p className="text-xs text-zinc-500 break-all">{userData.email}</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Member since {new Date(userData.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long" })}
                </p>
              </div>
            </div>
            <p className="text-xs text-zinc-500">Click the camera icon to upload a new profile photo</p>
          </div>
        </div>

        {/* Edit form */}
        <div className="bg-zinc-800/60 border border-zinc-700/60 rounded-2xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Edit3 size={15} className="text-zinc-400" />
              <h2 className="text-sm font-semibold text-zinc-200">Edit Profile</h2>
            </div>
            {!isEditing && (
              <button
                onClick={() => { setIsEditing(true); setProfileMsg({ type: "", text: "" }); }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-violet-400 border border-violet-800/60 rounded-lg hover:bg-violet-900/30 transition-colors"
              >
                <Edit3 size={12} /> Edit
              </button>
            )}
          </div>

          <div className="space-y-4">
            {[
              { label: "Display Name", key: "name",        type: "input",    placeholder: "Your name",          readonlyVal: userData.name },
              { label: "Bio",          key: "bio",         type: "textarea", placeholder: "Tell us about you…", readonlyVal: userData.bio },
              { label: "Home City",    key: "defaultCity", type: "input",    placeholder: "e.g. Mumbai, India", readonlyVal: userData.defaultCity },
            ].map(({ label, key, type, placeholder, readonlyVal }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">{label}</label>
                {isEditing ? (
                  type === "textarea" ? (
                    <textarea
                      value={editForm[key]}
                      onChange={e => setEditForm(prev => ({ ...prev, [key]: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2.5 bg-zinc-700/60 border border-zinc-600 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition resize-none"
                      placeholder={placeholder}
                    />
                  ) : (
                    <input
                      value={editForm[key]}
                      onChange={e => setEditForm(prev => ({ ...prev, [key]: e.target.value }))}
                      className="w-full px-3 py-2.5 bg-zinc-700/60 border border-zinc-600 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition"
                      placeholder={placeholder}
                    />
                  )
                ) : (
                  <p className="text-sm text-zinc-200 bg-zinc-700/30 px-3 py-2.5 rounded-xl border border-zinc-700/40 min-h-[40px] break-words">
                    {readonlyVal || <span className="text-zinc-600">Not set</span>}
                  </p>
                )}
              </div>
            ))}

            {/* Email (read-only always) */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                Email <span className="text-zinc-600 font-normal">(cannot be changed)</span>
              </label>
              <p className="text-sm text-zinc-400 bg-zinc-800/40 px-3 py-2.5 rounded-xl border border-zinc-700/30 break-all">{userData.email}</p>
            </div>
          </div>

          <AnimatePresence>
            {profileMsg.text && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className={`flex items-center gap-2 text-xs font-medium mt-4 px-3 py-2.5 rounded-lg border ${profileMsg.type === "success" ? "bg-emerald-900/30 text-emerald-300 border-emerald-800/50" : "bg-red-900/30 text-red-300 border-red-800/50"}`}
              >
                {profileMsg.type === "success" ? <CheckCircle size={13} /> : <X size={13} />}{profileMsg.text}
              </motion.div>
            )}
          </AnimatePresence>

          {isEditing && (
            <div className="flex flex-col sm:flex-row justify-end gap-2 mt-5">
              <button
                onClick={() => { setIsEditing(false); setEditForm({ name: userData.name || "", bio: userData.bio || "", defaultCity: userData.defaultCity || "" }); setProfileMsg({ type: "", text: "" }); }}
                disabled={profileSaving}
                className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-zinc-300 border border-zinc-600 rounded-xl hover:bg-zinc-700 transition-colors disabled:opacity-40"
              >Cancel</button>
              <button
                onClick={handleSaveProfile}
                disabled={profileSaving || !editForm.name.trim()}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 bg-violet-700 hover:bg-violet-600 text-white text-xs font-semibold rounded-xl transition-colors disabled:opacity-40"
              >
                {profileSaving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                {profileSaving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}