import { create } from 'zustand'
import { Node, Edge } from 'reactflow'

interface MindMapState {
  data: any | null; // Store the raw JSON mind map data from OpenAI
  nodes: Node[];
  edges: Edge[];
  setData: (data: any | null) => void; // Setter for raw data
  transformDataToFlow: () => void; // Function to transform data into nodes/edges
}

// Helper to transform OpenAI mind map JSON to React Flow nodes/edges
// This is a placeholder and needs to be adapted based on the actual JSON structure returned by OpenAI
const transformMindMapData = (data: any): { nodes: Node[], edges: Edge[] } => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    let nodeId = 1;

    const addNode = (label: string, parentId: string | null, level: number): string => {
        const id = `node-${nodeId++}`;
        const position = { x: level * 250, y: Math.random() * 400 }; // Simple positioning
        nodes.push({ 
            id, 
            data: { label }, 
            position, 
            type: 'default', // Or custom node types 
            style: { backgroundColor: '#1f2937', color: 'white', border: '1px solid #4b5563' } 
        });
        if (parentId) {
            edges.push({ id: `edge-${parentId}-${id}`, source: parentId, target: id, animated: true });
        }
        return id;
    };

    const traverse = (obj: any, parentId: string | null, level: number) => {
        for (const key in obj) {
            const value = obj[key];
            const currentId = addNode(key, parentId, level);
            
            if (typeof value === 'object' && value !== null) {
                traverse(value, currentId, level + 1);
            } else if (typeof value === 'string') {
                // Add leaf node for string values
                addNode(value, currentId, level + 1);
            }
        }
    };

    if (data && typeof data === 'object') {
        traverse(data, null, 0);
    }

    return { nodes, edges };
};

export const useMindMapStore = create<MindMapState>((set, get) => ({
  data: null,
  nodes: [],
  edges: [],
  setData: (data) => set((state) => {
    const { nodes, edges } = data ? transformMindMapData(data) : { nodes: [], edges: [] };
    return { data, nodes, edges };
  }),
  // This function can be called manually if needed, but setData now handles transformation
  transformDataToFlow: () => {
    const { data } = get();
    const { nodes, edges } = data ? transformMindMapData(data) : { nodes: [], edges: [] };
    set({ nodes, edges });
  },
})); 