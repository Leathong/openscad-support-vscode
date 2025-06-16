import py
import os.path

dirpath = py.path.local("./")

def pytest_generate_tests(metafunc):
    names = []
    if "filename" in metafunc.funcargnames:
        for fpath in dirpath.visit('*.scad'):
            names.append(fpath.basename)
        for fpath in dirpath.visit('*.py'):
            name = fpath.basename
            if not (name.startswith('test_') or name.startswith('_')):
                names.append(name)
    metafunc.parametrize("filename", names)

def test_README(filename):
    README = dirpath.join('README.markdown').read()

    assert filename in README
