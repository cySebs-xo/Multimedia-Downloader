import { useState, useEffect } from 'react';
import { useTypewriter } from '../hooks/useTypewriter';

export default function TypewriterWord() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const word = useTypewriter();

  if (!mounted) return null;
  return <span>{word}</span>;
}
