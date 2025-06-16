import py
import os.path
from openscad_utils import *


temppath = py.test.ensuretemp('MCAD')

def pytest_generate_tests(metafunc):
    if "modpath" in metafunc.funcargnames:
        args1 = []
        args2 = []
        for fpath, modnames in collect_test_modules().items():
            basename = os.path.splitext(os.path.split(str(fpath))[1])[0]
            if "modname" in metafunc.funcargnames:
                for modname in modnames:
                    args2.append([fpath, modname])
            else:
                args1.append(fpath)

        if "modname" in metafunc.funcargnames:
            metafunc.parametrize(["modpath", "modname"], args2)
        else:
            metafunc.parametrize("modpath", args1)

def test_module_compile(modname, modpath):
    tempname = modpath.basename + '-' + modname + '.scad'
    fpath = temppath.join(tempname)
    stlpath = temppath.join(tempname + ".stl")
    f = fpath.open('w')
    code = """
//generated testfile
use <%s>

%s();
""" % (modpath, modname)
    print(code)
    f.write(code)
    f.flush()
    output = call_openscad(path=fpath, stlpath=stlpath, timeout=60)
    print(output)
    assert output[0] is 0
    for s in ("warning", "error"):
        assert s not in output[2].strip().lower().decode("utf-8")
    assert len(stlpath.readlines()) > 2

def test_file_compile(modpath):
    stlpath = temppath.join(modpath.basename + "-test.stl")
    output = call_openscad(path=modpath, stlpath=stlpath)
    print(output)
    assert output[0] is 0
    for s in ("warning", "error"):
        assert s not in output[2].strip().lower().decode("utf-8")
    assert len(stlpath.readlines()) == 2
