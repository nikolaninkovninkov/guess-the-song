import { useEffect } from 'react';

export default function useDebug(debug: any) {
  useEffect(() => console.log(debug), [debug]);
}
