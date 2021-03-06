<template>
  <ul class="tree-view"
      :class="skinClass"
      role="tree"
      :aria-multiselectable="ariaMultiselectable">
    <tree-view-node v-for="(nodeModel) in model"
                    :key="nodeModel[nodeModel.treeNodeSpec && nodeModel.treeNodeSpec.idProperty ? nodeModel.treeNodeSpec.idProperty : 'id']"
                    :aria-key-map="ariaKeyMap"
                    :depth="0"
                    :model-defaults="modelDefaults"
                    :initial-model="nodeModel"
                    :selection-mode="selectionMode"
                    :tree-id="uniqueId"
                    :is-mounted="isMounted"
                    :initial-radio-group-values="radioGroupValues"
                    @treeViewNodeClick="(t, e)=>$emit(TvEvent.Click, t, e)"
                    @treeViewNodeDblclick="(t, e)=>$emit(TvEvent.DoubleClick, t, e)"
                    @treeViewNodeCheckboxChange="(t, e)=>$emit(TvEvent.CheckboxChange, t, e)"
                    @treeViewNodeRadioChange="(t, e)=>$emit(TvEvent.RadioChange, t, e)"
                    @treeViewNodeExpandedChange="(t, e)=>$emit(TvEvent.ExpandedChange, t, e)"
                    @treeViewNodeChildrenLoaded="(t, e)=>$emit(TvEvent.ChildrenLoad, t, e)"
                    @treeViewNodeSelectedChange="$_treeView_handleNodeSelectedChange"
                    @treeViewNodeAdd="(t, p, e)=>$emit(TvEvent.Add, t, p, e)"
                    @treeViewNodeDelete="$_treeView_handleChildDeletion"
                    @treeViewNodeAriaFocusable="$_treeViewAria_handleFocusableChange"
                    @treeViewNodeAriaRequestFirstFocus="$_treeViewAria_focusFirstNode"
                    @treeViewNodeAriaRequestLastFocus="$_treeViewAria_focusLastNode"
                    @treeViewNodeAriaRequestPreviousFocus="$_treeViewAria_handlePreviousFocus"
                    @treeViewNodeAriaRequestNextFocus="$_treeViewAria_handleNextFocus"
                    @treeViewNodeDragMove="$_treeViewDnd_dragMoveNode"
                    @treeViewNodeDrop="$_treeViewDnd_drop">

      <template #checkbox="{ model, customClasses, inputId, checkboxChangeHandler }">
        <slot name="checkbox" :model="model" :customClasses="customClasses" :inputId="inputId" :checkboxChangeHandler="checkboxChangeHandler"></slot>
      </template>
      <template #radio="{ model, customClasses, inputId, inputModel, radioChangeHandler }">
        <slot name="radio" :model="model" :customClasses="customClasses" :inputId="inputId" :inputModel="inputModel" :radioChangeHandler="radioChangeHandler"></slot>
      </template>
      <template #text="{ model, customClasses }">
        <slot name="text" :model="model" :customClasses="customClasses"></slot>
      </template>
      <template #loading="{ model, customClasses }">
        <slot name="loading" :model="model" :customClasses="customClasses"></slot>
      </template>
    </tree-view-node>
  </ul>
</template>

<script>
  import TreeViewAria from '../mixins/TreeViewAria';
  import TreeViewDragAndDrop from '../mixins/TreeViewDragAndDrop';
  import TreeViewNode from './TreeViewNode.vue';
  import SelectionMode from '../enums/selectionMode';
  import InputType from '../enums/inputType';
  import TvEvent from '../enums/event';

  export default {
    name: 'TreeView',
    mixins: [
      TreeViewAria,
      TreeViewDragAndDrop
    ],
    components: {
      TreeViewNode,
    },
    props: {
      initialModel: {
        type: Array,
        required: true
      },
      modelDefaults: {
        type: Object,
        required: false,
        default: function () { return {}; }
      },
      selectionMode: {
        type: String,
        required: false,
        default: SelectionMode.None,
        validator: function (value) {
          return Object.values(SelectionMode).includes(value);
        }
      },
      skinClass: {
        type: String,
        required: false,
        default: 'default-tree-view-skin',
        validator: function (value) {
          return value === null || !value.match(/\s/);
        }
      }
    },
    data() {
      return {
        uniqueId: null,
        model: this.initialModel,
        radioGroupValues: {},
        isMounted: false
      };
    },
    computed: {
      ariaMultiselectable() {
        // If there's no selectionMode, return a boolean so aria-multiselectable isn't included.
        // Otherwise, return either the string 'true' or 'false' as the attribute's value.
        return this.selectionMode === SelectionMode.None ? false : (this.selectionMode === SelectionMode.Multiple).toString();
      },
      TvEvent() {
        return TvEvent;
      }
    },
    created() {
      // Force a unique tree ID. This will generate a unique ID internally, but on mount
      // it will be set to the element ID if one is present.
      this.$set(this, 'uniqueId', generateUniqueId());
    },
    mounted() {
      this.$_treeView_enforceSingleSelectionMode();

      if (this.$el.id) {
        this.$set(this, 'uniqueId', this.$el.id);
      }

      // Set this in a $nextTick so the focusable watcher
      // in TreeViewNodeAria fires before isMounted is set.
      // Otherwise, it steals focus when the tree is mounted.
      this.$nextTick(() => {
        this.isMounted = true;
      });
    },
    methods: {
      /**
       * Gets any nodes with checked checkboxes.
       * @returns {Array<TreeViewNode>} An array of any nodes with checked checkboxes
       */
      getCheckedCheckboxes() {
        return this.getMatching((current) =>
          current.treeNodeSpec.input
          && current.treeNodeSpec.input.type === InputType.Checkbox
          && current.treeNodeSpec.state.input.value);
      },
      /**
       * Gets any nodes with checked checkboxes.
       * @returns {Array<TreeViewNode>} An array of any nodes with checked checkboxes
       */
      getCheckedRadioButtons() {
        return this.getMatching((current) =>
          current.treeNodeSpec.input
          && current.treeNodeSpec.input.type === InputType.RadioButton
          && this.radioGroupValues[current.treeNodeSpec.input.name] === current.treeNodeSpec.input.value);
      },
      /**
       * Gets any nodes matched by the given function.
       * @param matcherFunction {function} A function which takes a node as an argument
       * and returns a boolean indicating a match for some condition
       * @returns {Array<TreeViewNode>} An array of any nodes matched by the given function
       */
      getMatching(matcherFunction) {
        let matches = [];

        if (typeof matcherFunction === 'function') {
          this.$_treeView_depthFirstTraverse((current) => {
            if (matcherFunction(current)) {
              matches.push(current);
            }
          });
        }

        return matches;
      },
      /**
       * Gets any selected nodes
       * @returns {Array<TreeViewNode>} An array of any selected nodes
       */
      getSelected() {
        return this.selectionMode === SelectionMode.None
          ? []
          : this.getMatching((current) => current.treeNodeSpec.selectable && current.treeNodeSpec.state.selected);
      },
      /**
       * Gets the node with the given ID
       * @param targetId {string} The ID of the node to find
       * @returns {TreeViewNode} The node with the given ID if found, or null
       */
      $_treeView_findById(targetId) {
        let node = null;

        if (typeof targetId === 'string') {
          // Do a quick check to see if it's at the root level
          node = this.model.find(n => n[n.treeNodeSpec.idProperty] === targetId);

          if (!node) {
            this.$_treeView_depthFirstTraverse((current) => {
              let children = current[current.treeNodeSpec.childrenProperty];
              node = children.find(n => n[n.treeNodeSpec.idProperty] === targetId);
              if (node) {
                return false;
              }
            });
          }
        }

        return node;
      },
      /**
       * Removes and returns the node with the given ID
       * @param targetId {string} The ID of the node to remove
       * @returns {TreeViewNode} The node with the given ID if removed, or null
       */
      $_treeView_removeById(targetId) {
        let node = null;

        if (typeof targetId === 'string') {
          // Do a quick check to see if it's at the root level
          let nodeIndex = this.model.findIndex(n => n[n.treeNodeSpec.idProperty] === targetId);

          if (nodeIndex > -1) {
            node = this.model.splice(nodeIndex, 1)[0];
          }
          else {
            this.$_treeView_depthFirstTraverse((current) => {
              // See if this node has a child that matches
              let children = current[current.treeNodeSpec.childrenProperty];
              nodeIndex = children.findIndex(n => n[n.treeNodeSpec.idProperty] === targetId);
              if (nodeIndex > -1) {
                node = children.splice(nodeIndex, 1)[0];
                return false;
              }
            });
          }
        }

        return node;
      },
      /**
       * Traverses the tree depth-first and performs a callback action against each node.
       * @param nodeActionCallback {function} The action to call against each node, taking that node as a parameter
       */
      $_treeView_depthFirstTraverse(nodeActionCallback) {
        if (this.model.length === 0) {
          return;
        }

        let nodeQueue = this.model.slice();
        let continueCallbacks = true;

        while (nodeQueue.length > 0 && continueCallbacks !== false) {
          let current = nodeQueue.shift();

          // Push children to the front (depth first traversal)
          let childrenPropName = current.treeNodeSpec.childrenProperty;
          if (Array.isArray(current[childrenPropName])) {
            nodeQueue = current[childrenPropName].concat(nodeQueue);
          }

          // Use a return value of false to halt calling the callback on further nodes.
          continueCallbacks = nodeActionCallback(current);
        }
      },
      /**
       * Removes the given node from the array of children if found.
       * Note that only the node that was deleted fires these, not any subnode, so
       * this comes from a request from the child node for this node to delete it.
       * This emits the treeViewNodeDelete event.
       * @param node {TreeViewNode} The node to remove
       * @param event {Event} The initial event that triggered the deletion
       */
      $_treeView_handleChildDeletion(node, event) {
        let targetIndex = this.model.indexOf(node);
        if (targetIndex > -1) {
          this.$_treeViewAria_handleNodeDeletion(node);
          this.model.splice(targetIndex, 1);
        }

        this.$emit(TvEvent.Delete, node, event);
      },
      /**
       * For single selection mode, unselect any other selected node.
       * For selectionFollowsFocus mode, selection state is handled in TreeViewAria.$_treeViewAria_handleFocusableChange.
       * In all cases this emits treeViewNodeSelectedChange for the node parameter.
       * @param node {TreeViewNode} The node for which selection changed
       * @param event {Event} The initial event that triggered the change
       */
      $_treeView_handleNodeSelectedChange(node, event) {
        if (this.selectionMode === SelectionMode.Single && node.treeNodeSpec.state.selected) {
          this.$_treeView_depthFirstTraverse((current) => {
            if (current.treeNodeSpec.state.selected && current.id !== node.id) {
              current.treeNodeSpec.state.selected = false;
              return false;
            }
            return true;
          });
        }

        this.$emit(TvEvent.SelectedChange, node, event);
      },
      /**
       * Enforce single selection mode by deselecting anything except
       * the first (by depth-first) selected node.
       */
      $_treeView_enforceSingleSelectionMode() {
        // For single selection mode, only allow one selected node.
        if (this.selectionMode === SelectionMode.Single) {
          let alreadyFoundSelected = false;
          this.$_treeView_depthFirstTraverse((node) => {
            if (node.treeNodeSpec.state && node.treeNodeSpec.state.selected === true) {
              if (alreadyFoundSelected) {
                node.treeNodeSpec.state.selected = false;
              }
              else {
                alreadyFoundSelected = true;
              }
            }
          });
        }
      }
    }
  };

  // Fully private methods -----------------------------------

  /**
   * Creates an element ID that is unique across the document
   * @return {string} The generated ID
   */
  function generateUniqueId() {
    const stem = 'grtv-';
    let treeNum = 1;

    while (document.getElementById(stem + treeNum)) {
      treeNum++;
    }

    return stem + treeNum;
  }
</script>

<style lang="scss">

  // Embedded SCSS is the 'default-tree-view-skin' skin
  .tree-view.default-tree-view-skin {
    margin: 0;
    padding: 0;
    list-style: none;
  }

</style>