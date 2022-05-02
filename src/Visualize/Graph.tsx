import { chart } from '@rawgraphs/rawgraphs-core';
import { bubblechart } from "@rawgraphs/rawgraphs-charts";
import { useEffect, useState } from "react";
import styles from '../App/Form.module.css';

interface GraphProps {
  data: any[]
}

interface Mapping {
  x: string,
  y: string,
  color: string
}

const Graph = ({ data }: GraphProps) => {
  const [mapping, setMapping] = useState<Mapping>({ x: '', y: '', color: '' })

  const renderGraph = () => {
    const emptyMapping = Object.values(mapping).reduce((a, b) => (a === '') || (b === ''));
    if (emptyMapping) return;

    const dataRendered = data.map(
      d => ({ 
        [mapping.x]: parseInt(d[mapping.x]), 
        [mapping.y]: parseInt(d[mapping.y]), 
        [mapping.color]: d[mapping.color] 
      })
    )

    const viz = chart(bubblechart, {
      data: dataRendered,
      mapping: { 
        x: { value: mapping.x }, 
        y: { value: mapping.y }, 
        color: { value: mapping.color } 
      }
    })

    const graph = document.getElementById('graph');
    viz.renderToDOM(graph);
  }
  useEffect(renderGraph, [mapping, data]);

  const fields: string[] = ['', ...Object.keys(data[0])];
  return (
    <>
      <div className="mt-4">
        <h1 className='text-2xl'>Select graph parameters</h1>
        <div className="flex flex-row justify-between">
          <div className="mb-6">
            <label htmlFor="x">
              <span className="text-gray-200 text-xl">x coordinate</span>
            </label>
            <select
              className={styles.input}
              name="x"
              value={mapping.x}
              onChange={(e) => setMapping({ ...mapping, x: e.target.value })}
            >
              {fields.map((e, i) => <option key={`x-coord-${i}`}>{e}</option>) }
            </select>
          </div>
          <div className="mb-6">
            <label htmlFor="y">
              <span className="text-gray-200 text-xl">y coordinate</span>
            </label>
            <select
              className={styles.input}
              name="y"
              value={mapping.y}
              onChange={(e) => setMapping({ ...mapping, y: e.target.value })}
            >
              {fields.map((e, i) => <option key={`y-coord-${i}`}>{e}</option>) }
            </select>
          </div>
          <div className="mb-6">
            <label htmlFor="color">
              <span className="text-gray-200 text-xl">color</span>
            </label>
            <select
              className={styles.input}
              name="x"
              value={mapping.color}
              onChange={(e) => setMapping({ ...mapping, color: e.target.value })}
            >
              {fields.map((e, i) => <option key={`color-${i}`}>{e}</option>) }
            </select>
          </div>
        </div>
      </div>
      <div id="graph" className="flex flex-row justify-center mt-4 text-black"></div>
    </>
  )
}

export default Graph;