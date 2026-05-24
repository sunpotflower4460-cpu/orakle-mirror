// @ts-nocheck
import React from 'react';
import { Zap, Layers } from 'lucide-react';

export const MODES = {
  PURE: { id: 'pure', name: '純粋神託', label: 'Pure Channel', icon: <Zap size={12} />, guidance: '論理を手放し、詩的で抽象的なメッセージを受け取ります。感覚に浸りたい時に。', systemAdd: 'ここでは具体的なアドバイスや論理的な解説はしなくて構いません。ただ宇宙の海から流れ込む象徴的なヴィジョンや霊的な感覚に身を委ね、それをそのまま言葉にして届けてください。' },
  CARD: { id: 'card', name: '聖像解読', label: 'Card Reading', icon: <Layers size={12} />, guidance: '象徴（カード）からインスピレーションを受け、その響きを感性で言葉にします。', systemAdd: '引かれたカードは何かを論理的に説明するためのものではありません。その名前を詩の中に溶け込ませながら、象徴が放つエネルギーを感覚的に描写してくだされば十分です。解説しようとせず、ただ見えた情景をそのまま伝えてください。' }
};
