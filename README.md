# vue-tree

vue-tree is a Vue component that implements a TreeView control. Its aim is to provide common tree options in a way that is easy to use and easy to customize.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build status](https://ci.appveyor.com/api/projects/status/j8d19gt0vh16amhh/branch/master?svg=true)](https://ci.appveyor.com/project/Gregg/vue-tree/branch/master)

**The Component is still pre-1.0 and should be considered unstable. Breaking changes may occur at any time before the 1.0 release.**

Features include:

- A pleasing (or at least generally acceptable) default format in a wide field of browsers
- Expandable nodes
- Checkboxes
- Radio buttons

Planned:

- Node selection ([#5](https://github.com/grapoza/vue-tree/issues/5))
- Async loading ([#13](https://github.com/grapoza/vue-tree/issues/13))
- Adding/deleting nodes ([#24](https://github.com/grapoza/vue-tree/issues/24), [#16](https://github.com/grapoza/vue-tree/issues/16))
- Setting node enabled state ([#15](https://github.com/grapoza/vue-tree/issues/15))
- Config-based event handler overrides ([#25](https://github.com/grapoza/vue-tree/issues/25))
- Slots for full node customization ([#10](https://github.com/grapoza/vue-tree/issues/10))
- Icons ([#22](https://github.com/grapoza/vue-tree/issues/22))
- Searching ([#4](https://github.com/grapoza/vue-tree/issues/4))
- Drag n' Drop ([#6](https://github.com/grapoza/vue-tree/issues/6))
- Storing arbitrary data ([#7](https://github.com/grapoza/vue-tree/issues/7))

##  Installation

Install the plugin with your favorite package manager:
```shell
yarn add @grapoza/vue-tree
```
or
```shell
npm install --save @grapoza/vue-tree
```

## Usage

If you're using it in a .vue file:

```html
<template>
  <tree-view  id="my-tree" :model="dataModel"></tree-view>
</template>

<script>
import TreeView from "@grapoza/vue-tree"

export default {
  components: {
	  TreeView
  },
  data() {
    return {
      dataModel: [
        {id: "numberOrString", label: "Root Node", children: [
          {id: 1, label: "Child Node"},
          {id: "node2", label: "Second Child"}]
        }]
    }
  }
}
</script>
```

Or, import it into your application:

```javascript
import TreeView from "@grapoza/vue-tree"
Vue.use(TreeView)
```
Then add the component:
```html
<tree-view  id="my-tree" :model="dataModel"></tree-view>
```
```javascript
export default {
  data() {
    return {
      dataModel: [
        {id: "numberOrString", label: "Root Node", children: [
          {id: 1, label: "Child Node"},
          {id: "node2", label: "Second Child"}]
        }]
    }
  }
}
```

## Demos

To see it in action, try out the Demos (coming soon; [#32](https://github.com/grapoza/vue-tree/issues/32)).

## Props

| Prop             | Type     | Description                                                                    | Default value  | Required |
|:-----------------|:---------|:-------------------------------------------------------------------------------|:---------------|:---------|
| model            | Array    | The data model containing [tree data](#tree-data)                              | -              | Yes      |
| radioGroupValues | Object   | An object, the properties of which correspond to radio button group selections | `{}`           |          |

## Tree Data

The data passed to the treeview should be an array of nodes, where each node has the following structure. The data model passed to the treeview may be updated to include missing properties.

```javascript
{
  id: "node0",
  label: "A checkbox node",
  expandable: true,
  selectable: false,
  input: {
    type: 'checkbox'
  },
  state: {
    expanded: true,
    selected: false,
    input: {
      value: false
    }
  },
  children: []
},
{
  id: "node1",
  label: "A radio button node",
  expandable: true,
  selectable: false,
  input: {
    type: 'radio',
    name: 'rbGroup1',  // Used as the name attribute for the radio button
    value: 'thisValue' // Used as the value attribute for the radio button
  },
  state: {
    expanded: true,
    selected: false
    // No input state here; to let complex radio button groupings work, state is bound to a tree-level property
  },
  children: []
}
```

| Prop              | Type            | Description                                              | Default value                     | Required |
|:------------------|:----------------|:---------------------------------------------------------|:----------------------------------|:---------|
| id                | Number/String   | An ID that uniquely identifies this node within the tree | -                                 | Yes      |
| label             | String          | The text to show in the treeview                         | -                                 | Yes      |
| expandable        | Boolean         | True to show a toggle for expanding nodes' subnode lists | `true`                            |          |
| selectable        | Boolean         | True to allow the node to be selected*                   | `false`                           |          |
| input             | Object          | Contains data specific to the node's `input` element     | `null`                            |          |
| input.type        | String          | The type of input; valid values are `checkbox` or `radio`| -                                 | Yes**    |
| input.name        | String          | The name attribute of the input; used with `radio` type  | `'unspecifiedRadioName'`          |          |
| input.value       | String          | The value attribute of the input; used with `radio` type | `label`'s value***                |          |
| state             | Object          | Contains the current state of the node                   | -                                 |          |
| state.expanded    | Boolean         | True if this node's subnode list is expanded             | `false`                           |          |
| state.selected    | Boolean         | True if the node is selected*                            | `false`                           |          |
| state.input       | Object          | Contains any state related to the input field            | `{}` for checkbox, otherwise -    |          |
| state.input.value | Boolean         | Contains the value of the input                          | `false` for checkbox, otherwise - |          |
| children          | Array\<Object\> | The child nodes of this node                             | `[]`                              |          |

\* Selection props are unused; see [#5](https://github.com/grapoza/vue-tree/issues/5).

\*\* If `input.type` is not supplied, `input` is forced to `null`.

\*\*\* For `input.value`, `label`'s value is replaced with `label.replace(/[\s&<>"'\/]/g, '')`

## Methods

| Method                 | Description                            | Parameters | Returns                                                     |
|:-----------------------|:---------------------------------------|:-----------|:------------------------------------------------------------|
| getCheckedCheckboxes   | Gets models for checked checkbox nodes |            | An `Array<Object>` of models for checked checkbox nodes     |
| getCheckedRadioButtons | Gets models for checked radio nodes    |            | An `Array<Object>` of models for checked radio button nodes |

## Events

| Event                       | Description                                             | Handler Parameters                                                     |
|:----------------------------|:--------------------------------------------------------|:-----------------------------------------------------------------------|
| treeViewNodeClick           | Emitted when a node is clicked                          | `target` The model of the target node <br/> `event` The original event |
| treeViewNodeDblclick        | Emitted when a node is double clicked                   | `target` The model of the target node <br/> `event` The original event |
| treeViewNodeCheckboxChange  | Emitted when a node's checkbox emits a change event     | `target` The model of the target node <br/> `event` The original event |
| treeViewNodeRadioChange     | Emitted when a node's radio button emits a change event | `target` The model of the target node <br/> `event` The original event |
| treeViewNodeExpandedChange  | Emitted when a node is expanded or collapsed            | `target` The model of the target node <br/> `event` The original event |

## CSS Classes

The display of the treeview can be customized via CSS using the following classes. Class names are organized in a hierarchy, so a containing node's class is the prefix of its child classes.

| Class                                    | Affects                                                                          |
|------------------------------------------|----------------------------------------------------------------------------------|
| `tree-view`                              | The top-level tree view list                                                     |
| `tree-view-node`                         | A single node's list item                                                        |
| `tree-view-node-self`                    | The div containing the current node's UI                                         |
| `tree-view-node-self-expander`           | The button used to expand the children                                           |
| `tree-view-node-self-expanded`           | Applied to the expander button when the node is expanded                         |
| `tree-view-node-self-expanded-indicator` | The `<i>` element containing the expansion indicator                             |
| `tree-view-node-self-spacer`             | An empty spacer to replace fixed-width elements, _e.g._ the expander or checkbox |
| `tree-view-node-self-label`              | The label for the checkbox of checkable nodes                                    |
| `tree-view-node-self-input`              | Any type of input node within the tree node                                      |
| `tree-view-node-self-checkbox`           | The checkbox                                                                     |
| `tree-view-node-self-radio`              | The radio button                                                                 |
| `tree-view-node-self-text`               | The text for a non-input node                                                    |
| `tree-view-node-children`                | The list of child nodes                                                          |