import React, { useState } from 'react';
import { Project } from '../../types';
import { ArrowLeft, Code2, Layers, Check, Github, ArrowUpRight, FileCode, Cpu } from 'lucide-react';

interface TabletopToolsetViewProps {
  project: Project;
  onBack: () => void;
}

export const TabletopToolsetView: React.FC<TabletopToolsetViewProps> = ({ project, onBack }) => {
  const [selectedFile, setSelectedFile] = useState<'events.lua' | 'event_dispatcher.lua'>('events.lua');
  const [copiedCode, setCopiedCode] = useState(false);

  const eventsCode = `--- @class MonsterData
--- @field name string
--- @field hp string
--- @field ac string
--- @field mov string
--- @field size string
--- @field side string
--- @field image string (optional)

local Events = {}

-- Dictionary for possible events
Events.EVENT_NAMES = {
    parse_monster_data = "parse_monster_data",
    create_json_note = "create_json_note",

    -- in development
    player_hp_update = "player_hp_update",
    monster_hp_update = "monster_hp_update",
    monster_stress_update = "monster_stress_update",
    ruin_update = "ruin_update",
    on_roll = "on_roll",
    create_monster = "create_monster"
}



--- Subscribes to an event.
--- @param eventName string The name of the event.
--- @param func string The callback function name.
--- @overload fun(eventName: "parse_monster_data", func: fun(data: MonsterData))
--- @overload fun(eventName: "create_json_note", func: fun(data: MonsterData))
function Events.subscribe(eventName, func)
    Global.call("event_subscribe", {eventName = eventName, guid = self.getGUID(), functionName = func})
end

--- Broadcasts an event.
--- @param eventName string The name of the event.
--- @param ... any The event data.
--- @overload fun(eventName: "parse_monster_data", data: MonsterData)
--- @overload fun(eventName: "create_json_note", data: MonsterData)
function Events.broadcast(eventName, ...)
    Global.call("event_broadcast", {eventName = eventName, args = {...}})
end

return Events`;

  const eventDispatcherCode = `require("src.core.utils")

local EventDispatcher = {}
EventDispatcher.listeners = {}

-- Function to let other scripts subscribe to an event
function EventDispatcher.subscribe(eventName, listenerFunction)
    if EventDispatcher.listeners[eventName] == nil then
        EventDispatcher.listeners[eventName] = {} -- Create a new list for this event
    end
    table.insert(EventDispatcher.listeners[eventName], listenerFunction)
end

-- Function to broadcast an event to all subscribers
function EventDispatcher.broadcast(eventName, ...)
    if EventDispatcher.listeners[eventName] == nil then
        return -- No one is listening, do nothing
    end

    -- Call every function that subscribed to this event
    for _, listener in ipairs(EventDispatcher.listeners[eventName]) do
        listener(...) -- Pass along any arguments
    end
end

function EventDispatcher.list()
    log(EventDispatcher.listeners)
end

return EventDispatcher`;

  const currentCode = selectedFile === 'events.lua' ? eventsCode : eventDispatcherCode;
  const currentFileUrl = selectedFile === 'events.lua'
    ? 'https://github.com/Zavian/Tabletop-Simulator-Scripts-2.0/blob/master/src/core/events.lua'
    : 'https://github.com/Zavian/Tabletop-Simulator-Scripts-2.0/blob/master/src/core/event_dispatcher.lua';

  const copyCurrentCode = () => {
    navigator.clipboard.writeText(currentCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Navigation breadcrumb */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-mono text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors py-1 cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to all projects</span>
      </button>

      {/* Header */}
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="text-xs font-mono bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded text-emerald-800 dark:text-emerald-300">
            {project.period}
          </span>
          <span className="text-xs font-mono bg-emerald-700 dark:bg-emerald-600 text-white px-2 py-0.5 rounded font-semibold shadow-xs">
            2.0 Rewrite Active
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] dark:text-[#F3F4F6] mb-2">
          {project.title}
        </h1>
        <p className="text-base text-gray-600 dark:text-gray-400 mb-4">
          {project.subtitle}
        </p>

        {/* GitHub Repositories Card */}
        <div className="p-5 bg-white dark:bg-[#181A20] border border-gray-200 dark:border-[#2E333D] rounded flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="text-xs font-mono font-semibold uppercase text-emerald-700 dark:text-emerald-400">Source Repositories</div>
            <div className="text-sm font-bold text-[#1A1A1A] dark:text-[#F3F4F6]">Tabletop Simulator Scripts</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">github.com/Zavian/Tabletop-Simulator-Scripts-2.0</div>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href="https://github.com/Zavian/Tabletop-Simulator-Scripts"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-[#20242D] hover:bg-emerald-50/50 dark:hover:bg-[#282C37] border border-gray-200 dark:border-[#2E333D] text-[#1A1A1A] dark:text-[#F3F4F6] text-xs font-mono rounded transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              <span>Scripts v1 (2019-2025)</span>
              <ArrowUpRight className="w-3 h-3 text-gray-400" />
            </a>
            <a
              href="https://github.com/Zavian/Tabletop-Simulator-Scripts-2.0"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-mono rounded font-semibold shadow-xs transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              <span>Scripts 2.0 (Rewrite)</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {project.technologies.map((t) => (
            <span
              key={t}
              className="text-xs font-mono px-2 py-0.5 bg-gray-100 dark:bg-[#1F222A] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[#2E333D] rounded"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Overview paragraphs */}
      <div className="space-y-4 text-base text-gray-800 dark:text-gray-200 leading-relaxed">
        {project.detailedContent?.overview.map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>

      {/* Core Architecture Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-white dark:bg-[#181A20] border border-gray-200 dark:border-[#2E333D] rounded space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-700 dark:text-emerald-400 uppercase font-semibold">
            <Cpu className="w-3.5 h-3.5" />
            <span>Event-Driven Bus Architecture</span>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            Centralized event dispatcher managing decoupled subsystem communications, global hooks registration via <code className="font-mono text-emerald-700 dark:text-emerald-300">Global.call</code>, and isolated module execution.
          </p>
        </div>

        <div className="p-4 bg-white dark:bg-[#181A20] border border-gray-200 dark:border-[#2E333D] rounded space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-700 dark:text-emerald-400 uppercase font-semibold">
            <Layers className="w-3.5 h-3.5" />
            <span>Multi-Ruleset Abstraction</span>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            Decoupled rule evaluation engine allowing support for both traditional D&D 5e mechanics and modern dual-dice narrative systems like Daggerheart without rewriting UI layers.
          </p>
        </div>
      </div>

      {/* Source Code Viewer for TTS 2.0 Core */}
      <div className="border border-gray-200 dark:border-[#2E333D] rounded bg-white dark:bg-[#181A20] overflow-hidden">
        {/* File tabs */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-[#2E333D] bg-gray-50 dark:bg-[#1F222A] px-4 py-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedFile('events.lua')}
              className={`px-3 py-1.5 text-xs font-mono rounded transition-colors flex items-center gap-1.5 cursor-pointer ${
                selectedFile === 'events.lua'
                  ? 'bg-white dark:bg-[#181A20] text-emerald-700 dark:text-emerald-400 font-semibold border border-emerald-200 dark:border-emerald-800/80 shadow-xs'
                  : 'text-gray-500 dark:text-gray-400 hover:text-[#1A1A1A] dark:hover:text-[#F3F4F6]'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>src/core/events.lua</span>
            </button>
            <button
              onClick={() => setSelectedFile('event_dispatcher.lua')}
              className={`px-3 py-1.5 text-xs font-mono rounded transition-colors flex items-center gap-1.5 cursor-pointer ${
                selectedFile === 'event_dispatcher.lua'
                  ? 'bg-white dark:bg-[#181A20] text-emerald-700 dark:text-emerald-400 font-semibold border border-emerald-200 dark:border-emerald-800/80 shadow-xs'
                  : 'text-gray-500 dark:text-gray-400 hover:text-[#1A1A1A] dark:hover:text-[#F3F4F6]'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>src/core/event_dispatcher.lua</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={currentFileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1 text-xs font-mono text-gray-500 dark:text-gray-400 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
            >
              <span>View on GitHub</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>

            <button
              onClick={copyCurrentCode}
              className="flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 bg-white dark:bg-[#20242D] hover:bg-emerald-50 dark:hover:bg-[#282C37] border border-gray-200 dark:border-[#2E333D] rounded text-emerald-700 dark:text-emerald-400 transition-colors cursor-pointer"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Code2 className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Code body */}
        <pre className="p-4 bg-[#14161C] dark:bg-[#0E1015] text-[#E5E7EB] text-xs font-mono overflow-x-auto leading-relaxed max-h-[520px]">
          <code>{currentCode}</code>
        </pre>
      </div>

      {/* Technical challenges breakdown */}
      <div className="space-y-4">
        <h3 className="text-xs uppercase tracking-widest font-bold text-gray-400 dark:text-gray-500 font-mono">
          Technical Challenges & Solutions
        </h3>
        <div className="space-y-3">
          {project.detailedContent?.technicalChallenges.map((challenge, i) => (
            <div key={i} className="p-4 bg-gray-50 dark:bg-[#181A20] border border-gray-200 dark:border-[#2E333D] rounded text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {challenge}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
