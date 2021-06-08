import { Mesh } from "molstar/lib/mol-geo/geometry/mesh/mesh";
import { MeshBuilder } from "molstar/lib/mol-geo/geometry/mesh/mesh-builder";
import { Vec3 } from "molstar/lib/mol-math/linear-algebra";
import { Shape } from "molstar/lib/mol-model/shape";
import { PluginStateObject as SO } from "molstar/lib/mol-plugin-state/objects";
import { PluginContext } from "molstar/lib/mol-plugin/context";
import { Representation, RepresentationContext, RepresentationParamsGetter } from "molstar/lib/mol-repr/representation";
import { ShapeRepresentation } from "molstar/lib/mol-repr/shape/representation";
import { StateTransformer } from "molstar/lib/mol-state";
import { RuntimeContext, Task } from "molstar/lib/mol-task";
import { Color } from "molstar/lib/mol-util/color";
import { ColorNames } from 'molstar/lib/mol-util/color/names';
import { ParamDefinition as PD } from 'molstar/lib/mol-util/param-definition';
import { Model } from "molstar/lib/mol-model/structure";
import { BaseGeometry } from "molstar/lib/mol-geo/geometry/base";
import { addCylinder } from "molstar/lib/mol-geo/geometry/mesh/builder/cylinder";
import { DefaultCylinderProps } from "molstar/lib/mol-geo/primitive/cylinder";


interface ConvexHullData{
    vertices: number[],
    indices: number[],
    convexHullColor: Color, 
    opacity: number,  
}

const ConvexHullParams = {    
    ...Mesh.Params,
    ...BaseGeometry.Params,
    // alpha: { ...Mesh.Params.alpha, defaultValue: 0.7 },
}
type ConvexHullParams = typeof ConvexHullParams
type ConvexHullProps = PD.Values<ConvexHullParams>

function getConvexHullMesh(data: ConvexHullData, props: ConvexHullProps, mesh?: Mesh) {
    const state = MeshBuilder.createState(2048, 1024, mesh); 
       
    const a = Vec3();
    const b = Vec3();
    const c = Vec3();
    const edges = new Map<string, number[]>();

    // iterate over all faces 
    for (let i = 0; i < data.indices.length; i += 3) {
        state.currentGroup = i/3;
        Vec3.fromArray(a, data.vertices, data.indices[i+0]*3);
        Vec3.fromArray(b, data.vertices, data.indices[i+1]*3);
        Vec3.fromArray(c, data.vertices, data.indices[i+2]*3);  
        MeshBuilder.addTriangle(state, a, b, c);

        // to save only half of all edges // a bit ugly 
        const sortedIndices = [data.indices[i+0],data.indices[i+1],data.indices[i+2]].sort((a, b) => a - b); // ! numeric sort
        edges.set([sortedIndices[0], sortedIndices[1]].toString(), [sortedIndices[0], sortedIndices[1]])
        edges.set([sortedIndices[0], sortedIndices[2]].toString(), [sortedIndices[0], sortedIndices[2]])
        edges.set([sortedIndices[1], sortedIndices[2]].toString(), [sortedIndices[1], sortedIndices[2]])
    }
    
    // draw edges // even uglier...
    Array.from(edges.values()).forEach((v, j) => {
        let start = v[0], end = v[1];
        state.currentGroup = data.indices.length + j;
        Vec3.fromArray(a, data.vertices, start * 3)
        Vec3.fromArray(b, data.vertices, end * 3)
        addCylinder(state, a, b, 1, { ...DefaultCylinderProps, radiusTop:0.1, radiusBottom:0.1 })
    });

    console.log(`in getConvexHullMesh created ${data.indices.length/3} triangles, ${edges.size } edges`)
    return MeshBuilder.getMesh(state);
}

function getConvexHullShape(ctx: RuntimeContext, data: ConvexHullData, props: ConvexHullProps, shape?: Shape<Mesh>) {
    const geo = getConvexHullMesh(data, props, shape && shape.geometry);
    const label = (groupId: number) => { 
        if(groupId < data.indices.length/3 ) return `Convex-hull ${groupId}`
        else return `edge ${groupId}`
    };
    const coloring = (groupId: number) => { 
        if(groupId < data.indices.length/3 ) return data.convexHullColor
        else return ColorNames.black
    }
    // console.log(`props.alpha ${props.alpha}`);
    return Shape.create("Convex hull", data, geo, coloring, () => 1, label);
}


const SphereVisuals = {
    'mesh': (ctx: RepresentationContext, 
        getParams: RepresentationParamsGetter<ConvexHullData, ConvexHullParams>) => 
        ShapeRepresentation(getConvexHullShape, Mesh.Utils),
};

type ConvexHullRepresentation = Representation<ConvexHullData, ConvexHullParams>

function ConvexHullRepresentation(ctx: RepresentationContext, getParams: RepresentationParamsGetter<ConvexHullData, ConvexHullParams>): ConvexHullRepresentation {
    return Representation.createMulti('Convex Hull', ctx, getParams, 
                Representation.StateBuilder, 
                SphereVisuals as unknown as Representation.Def<ConvexHullData, ConvexHullParams>
    );
}

const CreateTransformer: StateTransformer.Builder.Root = StateTransformer.builderFactory('peprmint-namespace');

export const CreateConvexHull = CreateTransformer({
    name: 'create-convex-hull',
    display: 'convex hull',
    from: SO.Molecule.Model , // data source
    to: SO.Shape.Representation3D,
    params: {
        vertices: PD.Value([] as number[]),
        indices: PD.Value([] as number[]),
        convexHullColor: PD.Color(ColorNames.blue), 
        opacity: PD.Numeric( 0.5, { min: 0, max: 1, step: 0.01 }),
    }  
})({
    canAutoUpdate({ oldParams, newParams }) {
        return true;
    },
    apply({ a , params }, plugin: PluginContext) {
        // const center = Model.getCenter(a.data);
        return Task.create('Custom Convex Hull', async ctx => {
            const repr = ConvexHullRepresentation({ 
                webgl: plugin.canvas3d?.webgl, 
                ...plugin.representation.structure.themes},  
                () => { return {
                            ...ConvexHullParams,     
                            alpha: { ...Mesh.Params.alpha, defaultValue: params.opacity },
                        }
                    }
               );
            await repr.createOrUpdate({}, params).runInContext(ctx);
            return new SO.Shape.Representation3D(
                { repr, sourceData: params }, 
                { label: `Convex Hull` });
        });
    },
    update({ a, b, newParams }) {
        // a is Model, b is representation, newParams: { vertices: [], indices: [], opacity: 0.2 }
        return Task.create('Custom Convex Hull', async ctx => {
            const props = { ...b.data.sourceData as object, alpha: newParams.opacity };
            await b.data.repr.createOrUpdate(props, { ...props, convexHullColor: newParams.convexHullColor }).runInContext(ctx);
            return StateTransformer.UpdateResult.Updated;
        });
     
    }
});


