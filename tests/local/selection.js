export default [
  {
    id: 'node1',
    label: 'My First Node',
    children: [],
    treeNodeSpec: {
      expandable: true,
      selectable: true,
      deletable: true,
      input: {
        type: 'checkbox',
        name: 'checkbox1'
      },
      state: {
        expanded: false,
        selected: false,
        input: {
          value: false,
          disabled: false
        }
      }
    }
  },
  {
    id: 'node2',
    label: 'My Second Node',
    children: [
      {
        id: 'subnode1',
        label: 'This is a subnode',
        title: 'Even non-input nodes should get a title.',
        expandable: true,
        selectable: true,
        deletable: true,
        state: {
          expanded: false,
          selected: false
        },
        children: []
      },
      {
        id: 'subnode2',
        label: 'This is a checkable, checked subnode',
        children: [
          {
            id: 'subsubnode1',
            label: 'An even deeper node',
            children: [],
            expandable: true,
            selectable: true,
            state: {
              expanded: false,
              selected: false
            },
            addChildCallback: function () {
              var entry = prompt("Give it a string.", "");
              return Promise.resolve(entry ? { id: entry, label: entry, deletable: true, selectable: true } : null);
            }
          }
        ],
        treeNodeSpec: {
          expandable: true,
          selectable: true,
          input: {
            type: 'checkbox',
            name: 'checkbox3'
          },
          state: {
            expanded: false,
            selected: false,
            input: {
              value: true,
              disabled: true
            }
          }
        }
      }
    ],
    treeNodeSpec: {
      title: 'My second node, and its fantastic title',
      expandable: true,
      selectable: true,
      input: {
        type: 'checkbox',
        name: 'checkbox2'
      },
      state: {
        expanded: true,
        selected: false,
        input: {
          value: false,
          disabled: false
        }
      }
    }
  }
];