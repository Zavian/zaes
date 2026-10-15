import React from 'react';
import { ArrowDownAZ, CircleHelp, Download, Filter, FolderOpen, Sparkles, Trash2 } from 'lucide-react';
import { Button, Panel } from './primitives';

interface Props {
  cardCount: number;
  onLoad: () => void;
  onSave: () => void;
  onSample: () => void;
  onSort: () => void;
  onFilter: () => void;
  onHelp: () => void;
  onClear: () => void;
}

export const DeckActions: React.FC<Props> = ({ cardCount, onLoad, onSave, onSample, onSort, onFilter, onHelp, onClear }) => (
  <Panel title="Deck file">
    <div className="p-3 grid grid-cols-3 gap-2" role="toolbar" aria-label="Deck actions">
      <Button onClick={onLoad} title="Load a JSON save file"><FolderOpen className="w-3.5 h-3.5" /> Load</Button>
      <Button onClick={onSave} disabled={!cardCount} title="Save deck as JSON (Ctrl+S)"><Download className="w-3.5 h-3.5" /> Save</Button>
      <Button onClick={onSample}><Sparkles className="w-3.5 h-3.5" /> Sample</Button>
      <Button onClick={onSort} disabled={cardCount < 2}><ArrowDownAZ className="w-3.5 h-3.5" /> Sort</Button>
      <Button onClick={onFilter} disabled={!cardCount}><Filter className="w-3.5 h-3.5" /> Filter</Button>
      <Button onClick={onHelp} aria-label="Help (F1)" title="Help (F1)"><CircleHelp className="w-3.5 h-3.5" /> Help</Button>
      <Button variant="danger" className="col-span-3" onClick={onClear} disabled={!cardCount} title="Delete all cards">
        <Trash2 className="w-3.5 h-3.5" /> Delete all cards
      </Button>
    </div>
  </Panel>
);
