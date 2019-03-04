function TestingView() {
      var testingNode = new NodeView();
      testingNode.frame = {x:200, y:200, width:100, height:100};
      this.addSubview(testingNode);
};

TestingView.prototype = new View();